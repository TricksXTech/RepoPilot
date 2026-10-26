/**
 * RepoPilot Core Type Definitions
 * Track: PS04 Open-Source Contribution and Developer Workflow Agent
 */

export interface RepoIdentifier {
  owner: string;
  repo: string;
  issueNumber?: number;
}

export interface RepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssuesCount: number;
  defaultBranch: string;
  isArchived: boolean;
  isFork: boolean;
  isTemplate: boolean;
  license: {
    key: string;
    name: string;
    spdxId: string | null;
    url: string | null;
  } | null;
  htmlUrl: string;
}

export interface GovernanceDocs {
  readme: { path: string; url: string; content?: string } | null;
  contributing: { path: string; url: string; content?: string; rulesSummary?: string } | null;
  codeOfConduct: { path: string; url: string } | null;
  license: { path: string; url: string; name?: string } | null;
  prTemplate: { path: string; url: string; content?: string } | null;
  issueTemplates: Array<{ path: string; name: string }>;
}

export interface IssueDetails {
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  htmlUrl: string;
  author: string;
  assignees: string[];
  labels: Array<{ name: string; color: string; description?: string | null }>;
  commentsCount: number;
  comments: Array<{
    author: string;
    body: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface GoodFirstIssueSuggestion {
  number: number;
  title: string;
  labels: string[];
  htmlUrl: string;
  commentsCount: number;
  reason: string;
}

export interface CommitStyleInfo {
  style: "conventional" | "imperative" | "ticket-prefixed" | "freeform";
  sampleMessages: string[];
  guidance: string;
}

export interface OpenPullRequest {
  number: number;
  title: string;
  htmlUrl: string;
  author: string;
  createdAt: string;
  refersToIssue: boolean;
}

export interface EcosystemCommands {
  ecosystem: string;
  packageManager?: string;
  testCommands: string[];
  lintCommands: string[];
  buildCommands: string[];
  typecheckCommands?: string[];
  detectedFiles: string[];
  ciWorkflows: Array<{ name: string; path: string; url: string }>;
}

export interface RepoEvidence {
  meta: RepoMetadata;
  languages: Record<string, number>;
  governance: GovernanceDocs;
  issue: IssueDetails | null;
  suggestedIssues: GoodFirstIssueSuggestion[];
  tree: {
    totalFiles: number;
    samplePaths: string[];
    truncated: boolean;
  };
  ecosystem: EcosystemCommands;
  commitStyle: CommitStyleInfo;
  openPullRequests: OpenPullRequest[];
  potentialDuplicatePRs: OpenPullRequest[];
  fetchedAt: string;
}

export interface TouchedFilePlan {
  path: string;
  action: "modify" | "create" | "delete";
  reason: string;
  githubUrl: string;
  existsInTree: boolean;
}

export interface ContributionArtifact {
  issueSummary: string;
  plan: {
    overview: string;
    steps: Array<{
      stepNumber: number;
      title: string;
      description: string;
      targetFiles: string[];
    }>;
  };
  touchedFiles: TouchedFilePlan[];
  suggestedDiff: {
    unifiedDiff: string;
    explanation: string;
    disclaimer: string;
  };
  draftPR: {
    title: string;
    body: string;
    templateUsed: boolean;
    templatePath?: string;
  };
  draftCommit: {
    message: string;
    styleFollowed: string;
  };
  gitChecklist: {
    forkUrl: string;
    branchName: string;
    commands: Array<{
      step: string;
      command: string;
      description: string;
    }>;
  };
}

export interface VerificationCheck {
  id: string;
  title: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface VerificationReport {
  overallStatus: "pass" | "warn" | "fail";
  confidenceScore: number; // 0 - 100
  confidenceExplanation: string;
  scoreBreakdown: {
    base: number;
    deductions: Array<{ reason: string; amount: number }>;
  };
  checks: VerificationCheck[];
  timestamp: string;
}

export interface AnalysisPayload {
  stage: "validating" | "evidence" | "generating" | "verifying" | "complete" | "error";
  progressPercent: number;
  message: string;
  evidence?: RepoEvidence;
  artifact?: ContributionArtifact;
  verification?: VerificationReport;
  error?: {
    code: string;
    message: string;
    details?: string;
    resetAt?: string;
  };
}
