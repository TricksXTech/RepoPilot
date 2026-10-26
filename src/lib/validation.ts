/**
 * RepoPilot Input Validation and SSRF Protection
 * Strict Zod validation and safe GitHub URL parsing.
 */
import { z } from "zod";
import { RepoIdentifier } from "./types";

// Standard GitHub username and repo naming rules
// User/Org: up to 39 chars, alphanumeric with single hyphens, cannot begin/end with hyphen
const OWNER_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

// Repo name: up to 100 chars, alphanumeric, '.', '_', '-'
// Prevent directory traversal '../' or encoded sequences '%2e%2e'
const REPO_REGEX = /^[a-zA-Z0-9_.-]{1,100}$/;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Raw input validation schema for API requests
 */
export const AnalysisRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(3, "URL or repository path is too short")
    .max(500, "URL exceeds maximum permitted length (500 characters)"),
  issueNumber: z
    .number()
    .int("Issue number must be an integer")
    .positive("Issue number must be greater than 0")
    .max(1_000_000_000, "Issue number exceeds valid range")
    .optional(),
});

export type AnalysisRequestInput = z.infer<typeof AnalysisRequestSchema>;

/**
 * Parses and strictly sanitizes a GitHub repository URL or shorthand.
 * Defends against SSRF, directory traversal, CRLF injection, and arbitrary host redirects.
 */
export function parseAndValidateGitHubUrl(
  rawInput: string,
  explicitIssueNumber?: number
): RepoIdentifier {
  if (!rawInput || typeof rawInput !== "string") {
    throw new ValidationError("Input URL must be a non-empty string.");
  }

  const cleaned = rawInput.trim();

  // Guard against dangerous characters (null bytes, newlines, control characters)
  if (/[\x00-\x1F\x7F]/.test(cleaned)) {
    throw new ValidationError("Input contains invalid or control characters.");
  }

  // Path traversal and directory escape defense on raw input
  if (cleaned.includes("..") || cleaned.toLowerCase().includes("%2e")) {
    throw new ValidationError("Path traversal sequences are strictly prohibited.");
  }

  let owner = "";
  let repo = "";
  let detectedIssue: number | undefined = explicitIssueNumber;

  // Handle shorthand: "owner/repo" or "owner/repo#123"
  const shorthandMatch = cleaned.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)(?:#(\d+))?$/);
  if (shorthandMatch) {
    owner = shorthandMatch[1];
    repo = shorthandMatch[2];
    if (shorthandMatch[3]) {
      detectedIssue = parseInt(shorthandMatch[3], 10);
    }
  } else {
    // Treat as full URL
    let parsedUrl: URL;
    try {
      // If user forgot protocol, prepend https://
      const withProto = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
      parsedUrl = new URL(withProto);
    } catch {
      throw new ValidationError("Invalid URL format. Please provide a valid GitHub repository URL.");
    }

    // SSRF Defense: Host MUST strictly be github.com (no subdomains, no external hosts, no IP addresses)
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname !== "github.com") {
      throw new ValidationError(
        `Invalid host '${parsedUrl.hostname}'. RepoPilot strictly accepts 'github.com' repositories only.`
      );
    }

    // Path traversal defense
    const pathname = parsedUrl.pathname.replace(/\/+/g, "/"); // collapse duplicate slashes
    if (pathname.includes("..") || pathname.includes("/.") || pathname.includes("%2e") || pathname.includes("%2E")) {
      throw new ValidationError("Path traversal sequences are strictly prohibited.");
    }

    // Match path patterns:
    // /owner/repo
    // /owner/repo/issues/123
    // /owner/repo/pull/123 (warn or handle)
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length < 2) {
      throw new ValidationError(
        "Invalid GitHub path. Expected format: https://github.com/owner/repository"
      );
    }

    owner = segments[0];
    repo = segments[1].replace(/\.git$/i, ""); // Strip trailing .git if present

    if (segments[2] === "issues" && segments[3]) {
      const parsedNum = parseInt(segments[3], 10);
      if (!Number.isInteger(parsedNum) || parsedNum <= 0) {
        throw new ValidationError("Issue number in URL must be a positive integer.");
      }
      detectedIssue = parsedNum;
    }
  }

  // Strict regex assertion on owner
  if (!OWNER_REGEX.test(owner)) {
    throw new ValidationError(
      `Invalid repository owner name '${owner}'. GitHub usernames must be alphanumeric and up to 39 characters.`
    );
  }

  // Strict regex assertion on repo
  if (!REPO_REGEX.test(repo)) {
    throw new ValidationError(
      `Invalid repository name '${repo}'. Must contain only alphanumeric characters, periods, underscores, or hyphens.`
    );
  }

  return {
    owner,
    repo,
    issueNumber: detectedIssue,
  };
}
