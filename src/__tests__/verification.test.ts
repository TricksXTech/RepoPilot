import { describe, it, expect } from "vitest";
import { runVerificationEngine } from "../lib/verification";
import { RepoEvidence, ContributionArtifact } from "../lib/types";

describe("Verification Engine", () => {
  const mockEvidence: RepoEvidence = {
    meta: {
      owner: "mock-org",
      repo: "mock-project",
      fullName: "mock-org/mock-project",
      description: "Test repo",
      stars: 1200,
      forks: 300,
      openIssuesCount: 15,
      defaultBranch: "main",
      isArchived: false,
      isFork: false,
      isTemplate: false,
      license: { key: "mit", name: "MIT License", spdxId: "MIT", url: null },
      htmlUrl: "https://github.com/mock-org/mock-project",
    },
    languages: { TypeScript: 50000, JavaScript: 20000 },
    governance: {
      readme: { path: "README.md", url: "https://github.com/mock-org/mock-project/blob/main/README.md" },
      contributing: {
        path: "CONTRIBUTING.md",
        url: "https://github.com/mock-org/mock-project/blob/main/CONTRIBUTING.md",
      },
      codeOfConduct: null,
      license: { path: "LICENSE", url: "https://github.com/mock-org/mock-project/blob/main/LICENSE" },
      prTemplate: {
        path: ".github/pull_request_template.md",
        url: "https://github.com/mock-org/mock-project/blob/main/.github/pull_request_template.md",
      },
      issueTemplates: [],
    },
    issue: {
      number: 101,
      title: "Fix edge case in parser",
      body: "Parser breaks when string contains unicode emojis.",
      state: "open",
      htmlUrl: "https://github.com/mock-org/mock-project/issues/101",
      author: "alice",
      assignees: [],
      labels: [{ name: "bug", color: "d73a4a" }],
      commentsCount: 2,
      comments: [],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
    },
    suggestedIssues: [],
    tree: {
      totalFiles: 3,
      samplePaths: ["src/parser.ts", "src/index.ts", "package.json"],
      truncated: false,
    },
    ecosystem: {
      ecosystem: "TypeScript / Node.js",
      packageManager: "npm",
      testCommands: ["npm test"],
      lintCommands: ["npm run lint"],
      buildCommands: ["npm run build"],
      detectedFiles: ["package.json"],
      ciWorkflows: [],
    },
    commitStyle: {
      style: "conventional",
      sampleMessages: ["fix(parser): handle unicode"],
      guidance: "Use conventional commits",
    },
    openPullRequests: [],
    potentialDuplicatePRs: [],
    fetchedAt: "2026-01-01T00:00:00Z",
  };

  const mockArtifact: ContributionArtifact = {
    issueSummary: "Fix parser emoji handling",
    plan: {
      overview: "Update parser regex and add test",
      steps: [
        {
          stepNumber: 1,
          title: "Update regex in parser.ts",
          description: "Modify unicode regex pattern",
          targetFiles: ["src/parser.ts"],
        },
      ],
    },
    touchedFiles: [
      {
        path: "src/parser.ts",
        action: "modify",
        reason: "Fix unicode parsing",
        githubUrl: "https://github.com/mock-org/mock-project/blob/main/src/parser.ts",
        existsInTree: true,
      },
    ],
    suggestedDiff: {
      unifiedDiff: "--- a/src/parser.ts\n+++ b/src/parser.ts\n@@ -1,1 +1,1 @@",
      explanation: "Fix regex",
      disclaimer: "suggested, review before use",
    },
    draftPR: {
      title: "fix(parser): resolve unicode emoji parsing (#101)",
      body: "Fixes #101",
      templateUsed: true,
    },
    draftCommit: {
      message: "fix(parser): resolve unicode emoji parsing (#101)",
      styleFollowed: "conventional",
    },
    gitChecklist: {
      forkUrl: "https://github.com/mock-org/mock-project/fork",
      branchName: "fix/parser-unicode",
      commands: [],
    },
  };

  const rawTreePaths = ["src/parser.ts", "src/index.ts", "package.json", "README.md", "CONTRIBUTING.md"];

  it("yields high confidence score (100) when all checks pass", () => {
    const report = runVerificationEngine(mockEvidence, mockArtifact, rawTreePaths);
    expect(report.overallStatus).toBe("pass");
    expect(report.confidenceScore).toBe(100);
    expect(report.checks.every((c) => c.status === "pass")).toBe(true);
  });

  it("fails touched files check when hallucinated or missing file is planned", () => {
    const badArtifact: ContributionArtifact = {
      ...mockArtifact,
      touchedFiles: [
        {
          path: "src/non_existent_file.ts",
          action: "modify",
          reason: "Invented file",
          githubUrl: "",
          existsInTree: false,
        },
      ],
    };

    const report = runVerificationEngine(mockEvidence, badArtifact, rawTreePaths);
    expect(report.overallStatus).toBe("fail");
    const fileCheck = report.checks.find((c) => c.id === "files-exist");
    expect(fileCheck?.status).toBe("fail");
    expect(report.confidenceScore).toBeLessThan(80);
  });

  it("fails when repository is archived", () => {
    const archivedEvidence: RepoEvidence = {
      ...mockEvidence,
      meta: {
        ...mockEvidence.meta,
        isArchived: true,
      },
    };

    const report = runVerificationEngine(archivedEvidence, mockArtifact, rawTreePaths);
    expect(report.overallStatus).toBe("fail");
    const repoCheck = report.checks.find((c) => c.id === "repo-archived");
    expect(repoCheck?.status).toBe("fail");
    expect(report.confidenceScore).toBeLessThan(70);
  });

  it("warns when a duplicate pull request is detected", () => {
    const duplicateEvidence: RepoEvidence = {
      ...mockEvidence,
      potentialDuplicatePRs: [
        {
          number: 202,
          title: "Fix #101 emoji parser",
          htmlUrl: "https://github.com/mock-org/mock-project/pull/202",
          author: "bob",
          createdAt: "2026-01-01T00:00:00Z",
          refersToIssue: true,
        },
      ],
    };

    const report = runVerificationEngine(duplicateEvidence, mockArtifact, rawTreePaths);
    expect(report.overallStatus).toBe("warn");
    const dupCheck = report.checks.find((c) => c.id === "duplicate-pr");
    expect(dupCheck?.status).toBe("warn");
    expect(report.confidenceScore).toBe(85);
  });

  it("fails when target issue is closed", () => {
    const closedEvidence: RepoEvidence = {
      ...mockEvidence,
      issue: {
        ...mockEvidence.issue!,
        state: "closed",
      },
    };

    const report = runVerificationEngine(closedEvidence, mockArtifact, rawTreePaths);
    expect(report.overallStatus).toBe("fail");
    const issueCheck = report.checks.find((c) => c.id === "issue-state");
    expect(issueCheck?.status).toBe("fail");
  });
});
