import { describe, it, expect } from "vitest";
import { parseAndValidateGitHubUrl, ValidationError, AnalysisRequestSchema } from "../lib/validation";

describe("Input Validation & SSRF Security Protection", () => {
  describe("Valid GitHub Repository Inputs", () => {
    it("parses standard https repository URL", () => {
      const res = parseAndValidateGitHubUrl("https://github.com/facebook/react");
      expect(res.owner).toBe("facebook");
      expect(res.repo).toBe("react");
      expect(res.issueNumber).toBeUndefined();
    });

    it("parses URL with issue number", () => {
      const res = parseAndValidateGitHubUrl("https://github.com/vercel/next.js/issues/12345");
      expect(res.owner).toBe("vercel");
      expect(res.repo).toBe("next.js");
      expect(res.issueNumber).toBe(12345);
    });

    it("parses URL without protocol scheme", () => {
      const res = parseAndValidateGitHubUrl("github.com/expressjs/express");
      expect(res.owner).toBe("expressjs");
      expect(res.repo).toBe("express");
    });

    it("strips trailing .git suffix", () => {
      const res = parseAndValidateGitHubUrl("https://github.com/torvalds/linux.git");
      expect(res.owner).toBe("torvalds");
      expect(res.repo).toBe("linux");
    });

    it("supports owner/repo shorthand", () => {
      const res = parseAndValidateGitHubUrl("tailwindlabs/tailwindcss#500");
      expect(res.owner).toBe("tailwindlabs");
      expect(res.repo).toBe("tailwindcss");
      expect(res.issueNumber).toBe(500);
    });

    it("honors explicit issue number argument", () => {
      const res = parseAndValidateGitHubUrl("https://github.com/rust-lang/rust", 98765);
      expect(res.owner).toBe("rust-lang");
      expect(res.repo).toBe("rust");
      expect(res.issueNumber).toBe(98765);
    });
  });

  describe("Malicious & Non-GitHub Host Rejections (SSRF Shields)", () => {
    it("rejects non-github.com hosts", () => {
      expect(() => parseAndValidateGitHubUrl("https://gitlab.com/owner/repo")).toThrowError(
        ValidationError
      );
    });

    it("rejects subdomain phishing attacks", () => {
      expect(() =>
        parseAndValidateGitHubUrl("https://github.com.attacker-controlled.site/owner/repo")
      ).toThrowError(ValidationError);
    });

    it("rejects localhost and private network SSRF targets", () => {
      expect(() => parseAndValidateGitHubUrl("http://localhost:8080/admin")).toThrowError(
        ValidationError
      );
      expect(() => parseAndValidateGitHubUrl("http://127.0.0.1/secrets")).toThrowError(
        ValidationError
      );
      expect(() => parseAndValidateGitHubUrl("http://169.254.169.254/latest/meta-data")).toThrowError(
        ValidationError
      );
    });

    it("rejects path traversal attempts", () => {
      expect(() => parseAndValidateGitHubUrl("https://github.com/owner/repo/../../etc/passwd")).toThrowError(
        ValidationError
      );
      expect(() => parseAndValidateGitHubUrl("https://github.com/owner/%2e%2e/root")).toThrowError(
        ValidationError
      );
    });

    it("rejects control characters and null byte injection", () => {
      expect(() => parseAndValidateGitHubUrl("https://github.com/owner/repo\x00malicious")).toThrowError(
        ValidationError
      );
      expect(() => parseAndValidateGitHubUrl("https://github.com/owner/repo\nHeader: Injection")).toThrowError(
        ValidationError
      );
    });

    it("rejects invalid issue numbers (negative, NaN, floats)", () => {
      expect(() =>
        parseAndValidateGitHubUrl("https://github.com/owner/repo/issues/-5")
      ).toThrowError(ValidationError);
      expect(() =>
        parseAndValidateGitHubUrl("https://github.com/owner/repo/issues/notanumber")
      ).toThrowError(ValidationError);
    });
  });

  describe("Zod Request Schema", () => {
    it("validates legitimate payloads", () => {
      const parsed = AnalysisRequestSchema.safeParse({
        url: "https://github.com/colinhacks/zod",
        issueNumber: 42,
      });
      expect(parsed.success).toBe(true);
    });

    it("rejects payload exceeding length limit", () => {
      const parsed = AnalysisRequestSchema.safeParse({
        url: "https://github.com/owner/" + "a".repeat(600),
      });
      expect(parsed.success).toBe(false);
    });
  });
});
