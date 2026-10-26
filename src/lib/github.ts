/**
 * GitHub REST API Client
 * Read-only, SSRF-protected, parallelized evidence collector with rate limit detection.
 */
import {
  RepoEvidence,
  RepoMetadata,
  GovernanceDocs,
  IssueDetails,
  GoodFirstIssueSuggestion,
  OpenPullRequest,
  CommitStyleInfo,
} from "./types";
import { detectEcosystemAndCommands } from "./ecosystem";

const GITHUB_API_BASE = "https://api.github.com";
const TIMEOUT_MS = 10_000;
const MAX_FILE_SIZE_BYTES = 50_000; // 50KB limit per governance / config file

export class GitHubApiError extends Error {
  status: number;
  rateLimitReset?: string;
  isRateLimit: boolean;

  constructor(message: string, status: number, rateLimitReset?: string) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.rateLimitReset = rateLimitReset;
    this.isRateLimit = status === 403 || status === 429;
  }
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoPilot-OpenSource-Agent/1.0",
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Strict fetch wrapper with timeout, redirect blocking, and error extraction
 */
async function fetchGitHub(endpoint: string, options?: RequestInit): Promise<Response> {
  // Ensure the endpoint is strictly a relative path on api.github.com
  const safePath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const targetUrl = `${GITHUB_API_BASE}${safePath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options?.headers || {}),
      },
      signal: controller.signal,
      redirect: "error", // Prevent SSRF redirect bypass
      next: { revalidate: 120 }, // 2-minute server-side cache window
    });

    // Check rate limits
    const resetTime = response.headers.get("x-ratelimit-reset");

    if (response.status === 403 || response.status === 429) {
      let resetMsg = "";
      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime, 10) * 1000);
        resetMsg = `Rate limit resets at ${resetDate.toLocaleTimeString()}.`;
      }
      const tokenTip = !process.env.GITHUB_TOKEN
        ? " Add a read-only GITHUB_TOKEN in your environment or Vercel settings to get 5,000 requests/hour."
        : "";

      throw new GitHubApiError(
        `GitHub API rate limit exceeded. ${resetMsg}${tokenTip}`,
        response.status,
        resetTime || undefined
      );
    }

    if (response.status === 404) {
      throw new GitHubApiError(
        "Repository or resource not found on GitHub. Please check that the repository is public and correctly spelled.",
        404
      );
    }

    if (!response.ok) {
      throw new GitHubApiError(
        `GitHub API returned status ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return response;
  } catch (err: unknown) {
    if (err instanceof GitHubApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new GitHubApiError("GitHub API request timed out after 10 seconds.", 408);
    }
    throw new GitHubApiError(
      err instanceof Error ? err.message : "Unknown error connecting to GitHub API",
      500
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches raw text content of a file from GitHub
 */
async function fetchFileContent(
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<string | null> {
  try {
    const res = await fetchGitHub(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`);
    const data = await res.json();

    if (data.type === "file" && data.content) {
      const decoded = Buffer.from(data.content, "base64").toString("utf-8");
      return decoded.length > MAX_FILE_SIZE_BYTES
        ? decoded.slice(0, MAX_FILE_SIZE_BYTES) + "\n...[Truncated for safe analysis]"
        : decoded;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Analyzes commit messages to detect convention
 */
function analyzeCommitStyle(commits: Array<{ commit: { message: string } }>): CommitStyleInfo {
  if (!commits || commits.length === 0) {
    return {
      style: "freeform",
      sampleMessages: [],
      guidance: "Use clear, concise imperative commit messages (e.g., 'Fix #123: correct edge case').",
    };
  }

  const messages = commits.map((c) => c.commit.message.split("\n")[0].trim()).filter(Boolean);
  const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\([a-z0-9_-]+\))?:\s.+/i;
  const ticketRegex = /^[A-Z]{2,}-\d+[:\s].+/;

  const conventionalCount = messages.filter((m) => conventionalRegex.test(m)).length;
  const ticketCount = messages.filter((m) => ticketRegex.test(m)).length;

  if (conventionalCount >= Math.max(2, Math.floor(messages.length * 0.4))) {
    return {
      style: "conventional",
      sampleMessages: messages.slice(0, 5),
      guidance: "This repository uses Conventional Commits (e.g. 'feat(core): add feature', 'fix(api): handle timeout'). Follow this exact convention.",
    };
  }

  if (ticketCount >= Math.max(2, Math.floor(messages.length * 0.3))) {
    return {
      style: "ticket-prefixed",
      sampleMessages: messages.slice(0, 5),
      guidance: "This repository prefixes commits with ticket IDs (e.g. 'PROJ-123: description').",
    };
  }

  return {
    style: "imperative",
    sampleMessages: messages.slice(0, 5),
    guidance: "Use imperative mood in the subject line (e.g., 'Add verification check', not 'Added' or 'Adds').",
  };
}

/**
 * Primary Evidence Collector
 * Executes parallel requests to assemble complete ground-truth evidence.
 */
export async function collectRepositoryEvidence(
  owner: string,
  repo: string,
  targetIssueNumber?: number
): Promise<{ evidence: RepoEvidence; rawTreePaths: string[] }> {
  // 1. Parallel Request Phase A: Repo Metadata, Languages, Recent Commits, Open PRs
  const [repoRes, langRes, commitsRes, pullsRes] = await Promise.all([
    fetchGitHub(`/repos/${owner}/${repo}`).then((r) => r.json()),
    fetchGitHub(`/repos/${owner}/${repo}/languages`).then((r) => r.json()),
    fetchGitHub(`/repos/${owner}/${repo}/commits?per_page=15`)
      .then((r) => r.json())
      .catch(() => []),
    fetchGitHub(`/repos/${owner}/${repo}/pulls?state=open&per_page=30`)
      .then((r) => r.json())
      .catch(() => []),
  ]);

  const defaultBranch = repoRes.default_branch || "main";
  const meta: RepoMetadata = {
    owner: repoRes.owner?.login || owner,
    repo: repoRes.name || repo,
    fullName: repoRes.full_name || `${owner}/${repo}`,
    description: repoRes.description,
    stars: repoRes.stargazers_count || 0,
    forks: repoRes.forks_count || 0,
    openIssuesCount: repoRes.open_issues_count || 0,
    defaultBranch,
    isArchived: Boolean(repoRes.archived),
    isFork: Boolean(repoRes.fork),
    isTemplate: Boolean(repoRes.is_template),
    license: repoRes.license
      ? {
          key: repoRes.license.key,
          name: repoRes.license.name,
          spdxId: repoRes.license.spdx_id,
          url: repoRes.license.url,
        }
      : null,
    htmlUrl: repoRes.html_url || `https://github.com/${owner}/${repo}`,
  };

  // 2. Recursive Git Trees Call (Single recursive call)
  let treePaths: string[] = [];
  let treeTruncated = false;

  try {
    const treeRes = await fetchGitHub(
      `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`
    ).then((r) => r.json());

    if (Array.isArray(treeRes.tree)) {
      treeTruncated = Boolean(treeRes.truncated);
      treePaths = treeRes.tree
        .filter((item: { type: string; path: string }) => item.type === "blob")
        .map((item: { path: string }) => item.path);
    }
  } catch {
    // If empty repo or branch tree unavailable
    treePaths = [];
  }

  // 3. Find Governance Documents from tree paths (check root, .github/, and docs/)
  const lowerPaths = treePaths.map((p) => ({ original: p, lower: p.toLowerCase() }));

  const findPath = (candidates: string[]) => {
    // Priority 1: Exact root file match (e.g. "README.md", "package.json")
    for (const c of candidates) {
      const rootMatch = lowerPaths.find((item) => item.lower === c);
      if (rootMatch) return rootMatch.original;
    }
    // Priority 2: Standard folder match (.github/ or docs/)
    for (const c of candidates) {
      const stdMatch = lowerPaths.find(
        (item) => item.lower === `.github/${c}` || item.lower === `docs/${c}`
      );
      if (stdMatch) return stdMatch.original;
    }
    // Priority 3: Any path ending with /candidate (excluding .changeset or test fixtures)
    for (const c of candidates) {
      const fallback = lowerPaths.find(
        (item) =>
          item.lower.endsWith(`/${c}`) &&
          !item.lower.includes(".changeset") &&
          !item.lower.includes("__tests__") &&
          !item.lower.includes("fixtures")
      );
      if (fallback) return fallback.original;
    }
    return null;
  };

  const readmePath = findPath([
    "readme.md",
    "readme.markdown",
    "readme.rst",
    "readme.txt",
    "readme",
  ]);
  const contributingPath = findPath([
    "contributing.md",
    ".github/contributing.md",
    "docs/contributing.md",
    "contributing",
  ]);
  const codeOfConductPath = findPath([
    "code_of_conduct.md",
    ".github/code_of_conduct.md",
    "docs/code_of_conduct.md",
  ]);
  const licensePath = findPath(["license", "license.md", "license.txt", "copying"]);
  const prTemplatePath = findPath([
    ".github/pull_request_template.md",
    "pull_request_template.md",
    ".github/pull_request_template.txt",
  ]);

  const issueTemplates = lowerPaths
    .filter((item) => item.lower.startsWith(".github/issue_template/"))
    .map((item) => ({ path: item.original, name: item.original.split("/").pop() || item.original }));

  // 4. Parallel Request Phase B: Fetch Text Contents of Governance & Key Ecosystem Configs
  const filesToFetch: Array<{ key: string; path: string }> = [];
  if (contributingPath) filesToFetch.push({ key: "contributing", path: contributingPath });
  if (prTemplatePath) filesToFetch.push({ key: "prTemplate", path: prTemplatePath });
  if (readmePath) filesToFetch.push({ key: "readme", path: readmePath });

  const pkgJsonPath = findPath(["package.json"]);
  if (pkgJsonPath) filesToFetch.push({ key: "packageJson", path: pkgJsonPath });

  const makefilePath = findPath(["makefile", "gnumakefile"]);
  if (makefilePath) filesToFetch.push({ key: "makefile", path: makefilePath });

  const contentsMap: Record<string, string | null> = {};
  await Promise.all(
    filesToFetch.map(async ({ key, path }) => {
      contentsMap[key] = await fetchFileContent(owner, repo, defaultBranch, path);
    })
  );

  const governance: GovernanceDocs = {
    readme: readmePath
      ? {
          path: readmePath,
          url: `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${readmePath}`,
          content: contentsMap.readme || undefined,
        }
      : null,
    contributing: contributingPath
      ? {
          path: contributingPath,
          url: `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${contributingPath}`,
          content: contentsMap.contributing || undefined,
        }
      : null,
    codeOfConduct: codeOfConductPath
      ? {
          path: codeOfConductPath,
          url: `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${codeOfConductPath}`,
        }
      : null,
    license: licensePath
      ? {
          path: licensePath,
          url: `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${licensePath}`,
          name: meta.license?.name,
        }
      : null,
    prTemplate: prTemplatePath
      ? {
          path: prTemplatePath,
          url: `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${prTemplatePath}`,
          content: contentsMap.prTemplate || undefined,
        }
      : null,
    issueTemplates,
  };

  // 5. Detect Ecosystem & Test/Lint Commands
  const ecosystem = detectEcosystemAndCommands({
    treePaths,
    packageJsonContent: contentsMap.packageJson,
    makefileContent: contentsMap.makefile,
  });

  // 6. Commit Style Analysis
  const commitStyle = analyzeCommitStyle(commitsRes);

  // 7. Parse Open Pull Requests & Potential Duplicates
  const openPullRequests: OpenPullRequest[] = pullsRes.map((p: {
    number: number;
    title: string;
    html_url: string;
    user: { login: string };
    created_at: string;
    body: string | null;
  }) => ({
    number: p.number,
    title: p.title,
    htmlUrl: p.html_url,
    author: p.user?.login || "unknown",
    createdAt: p.created_at,
    refersToIssue: Boolean(
      targetIssueNumber &&
        (p.title.includes(`#${targetIssueNumber}`) ||
          (p.body && p.body.includes(`#${targetIssueNumber}`)))
    ),
  }));

  const potentialDuplicatePRs = openPullRequests.filter((pr) => pr.refersToIssue);

  // 8. Issue Handling: Target Issue OR Top 5 Good First Issues
  let targetIssue: IssueDetails | null = null;
  let suggestedIssues: GoodFirstIssueSuggestion[] = [];

  if (targetIssueNumber) {
    try {
      const [issueData, commentsData] = await Promise.all([
        fetchGitHub(`/repos/${owner}/${repo}/issues/${targetIssueNumber}`).then((r) => r.json()),
        fetchGitHub(`/repos/${owner}/${repo}/issues/${targetIssueNumber}/comments?per_page=10`)
          .then((r) => r.json())
          .catch(() => []),
      ]);

      targetIssue = {
        number: issueData.number,
        title: issueData.title,
        body: issueData.body,
        state: issueData.state,
        htmlUrl: issueData.html_url,
        author: issueData.user?.login || "unknown",
        assignees: Array.isArray(issueData.assignees)
          ? issueData.assignees.map((a: { login: string }) => a.login)
          : [],
        labels: Array.isArray(issueData.labels)
          ? issueData.labels.map((l: { name: string; color: string; description?: string }) => ({
              name: l.name,
              color: l.color,
              description: l.description,
            }))
          : [],
        commentsCount: issueData.comments || 0,
        comments: Array.isArray(commentsData)
          ? commentsData.map((c: { user: { login: string }; body: string; created_at: string }) => ({
              author: c.user?.login || "unknown",
              body: c.body ? c.body.slice(0, 1000) : "",
              createdAt: c.created_at,
            }))
          : [],
        createdAt: issueData.created_at,
        updatedAt: issueData.updated_at,
      };
    } catch {
      targetIssue = null;
    }
  } else {
    // Suggest top 5 "good first issue" or "help wanted" or open issues
    try {
      const issuesRes = await fetchGitHub(
        `/repos/${owner}/${repo}/issues?state=open&per_page=20&sort=updated`
      ).then((r) => r.json());

      if (Array.isArray(issuesRes)) {
        // Filter out pull requests (GitHub API returns PRs in issues endpoint if pull_request key is present)
        const pureIssues = issuesRes.filter((item: { pull_request?: object }) => !item.pull_request);

        // Sort by good first issue / help wanted labels first
        const scoredIssues = pureIssues.map((item: {
          number: number;
          title: string;
          labels: Array<{ name: string }>;
          html_url: string;
          comments: number;
          assignees?: Array<unknown>;
        }) => {
          const labelNames = item.labels.map((l) => l.name.toLowerCase());
          const isGoodFirst = labelNames.some(
            (l) => l.includes("good first") || l.includes("help wanted") || l.includes("beginner") || l.includes("easy")
          );
          const isUnassigned = !item.assignees || item.assignees.length === 0;

          let reason = "Active open issue suitable for community contribution.";
          if (isGoodFirst && isUnassigned) {
            reason = "Explicitly labeled for beginners/community and currently unassigned.";
          } else if (isGoodFirst) {
            reason = "Labeled for beginners/help-wanted.";
          } else if (isUnassigned) {
            reason = "Unassigned open issue with active maintainer attention.";
          }

          return {
            number: item.number,
            title: item.title,
            labels: item.labels.map((l) => l.name),
            htmlUrl: item.html_url,
            commentsCount: item.comments || 0,
            reason,
            priorityScore: (isGoodFirst ? 10 : 0) + (isUnassigned ? 5 : 0),
          };
        });

        scoredIssues.sort((a, b) => b.priorityScore - a.priorityScore);
        suggestedIssues = scoredIssues.slice(0, 5).map((item) => ({
          number: item.number,
          title: item.title,
          labels: item.labels,
          htmlUrl: item.htmlUrl,
          commentsCount: item.commentsCount,
          reason: item.reason,
        }));
      }
    } catch {
      suggestedIssues = [];
    }
  }

  const evidence: RepoEvidence = {
    meta,
    languages: langRes || {},
    governance,
    issue: targetIssue,
    suggestedIssues,
    tree: {
      totalFiles: treePaths.length,
      samplePaths: treePaths.slice(0, 50),
      truncated: treeTruncated,
    },
    ecosystem,
    commitStyle,
    openPullRequests,
    potentialDuplicatePRs,
    fetchedAt: new Date().toISOString(),
  };

  return { evidence, rawTreePaths: treePaths };
}
