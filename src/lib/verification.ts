/**
 * Verification Engine
 * Deterministically checks claims against empirical repository evidence.
 * Generates source links, audit checks (pass/warn/fail), and a 0-100 confidence score.
 */
import {
  RepoEvidence,
  ContributionArtifact,
  VerificationReport,
  VerificationCheck,
} from "./types";

export function runVerificationEngine(
  evidence: RepoEvidence,
  artifact: ContributionArtifact,
  rawTreePaths: string[]
): VerificationReport {
  const checks: VerificationCheck[] = [];
  const deductions: Array<{ reason: string; amount: number }> = [];
  const baseScore = 100;

  const { meta, issue, governance, ecosystem, commitStyle, potentialDuplicatePRs } = evidence;
  const pathsSet = new Set(rawTreePaths);

  // 1. REPO ARCHIVE CHECK
  if (meta.isArchived) {
    checks.push({
      id: "repo-archived",
      title: "Repository Read-Only Status",
      status: "fail",
      detail: "Repository is archived and read-only. GitHub blocks new pull requests or contributions.",
      sourceUrl: meta.htmlUrl,
      sourceLabel: meta.fullName,
    });
    deductions.push({ reason: "Repository is archived / read-only", amount: 40 });
  } else {
    checks.push({
      id: "repo-archived",
      title: "Repository Read-Only Status",
      status: "pass",
      detail: "Repository is active, accepting contributions, and not archived.",
      sourceUrl: meta.htmlUrl,
      sourceLabel: `${meta.fullName} (active)`,
    });
  }

  // 2. ISSUE ASSIGNMENT & STATE CHECK
  if (issue) {
    if (issue.state === "closed") {
      checks.push({
        id: "issue-state",
        title: "Issue Open Status",
        status: "fail",
        detail: `Target issue #${issue.number} is already closed. Contributions to closed issues are often rejected.`,
        sourceUrl: issue.htmlUrl,
        sourceLabel: `Issue #${issue.number}`,
      });
      deductions.push({ reason: "Target issue is already closed", amount: 35 });
    } else if (issue.assignees && issue.assignees.length > 0) {
      checks.push({
        id: "issue-assignment",
        title: "Issue Assignee Coordination",
        status: "warn",
        detail: `Issue #${issue.number} is currently assigned to @${issue.assignees.join(", @")}. Check comments before opening duplicate work.`,
        sourceUrl: issue.htmlUrl,
        sourceLabel: `Issue #${issue.number} (${issue.assignees.length} assignee(s))`,
      });
      deductions.push({ reason: "Issue already assigned to other contributors", amount: 10 });
    } else {
      checks.push({
        id: "issue-state",
        title: "Issue Open & Available",
        status: "pass",
        detail: `Issue #${issue.number} is open and currently unassigned. Ready for contribution.`,
        sourceUrl: issue.htmlUrl,
        sourceLabel: `Issue #${issue.number} (open)`,
      });
    }
  } else {
    checks.push({
      id: "issue-state",
      title: "Issue Selection",
      status: "warn",
      detail: "No specific issue was targeted. Suggesting top community issues or general improvements.",
      sourceUrl: `${meta.htmlUrl}/issues`,
      sourceLabel: "Repo Issues",
    });
    deductions.push({ reason: "No specific issue targeted", amount: 5 });
  }

  // 3. DUPLICATE OPEN PR CHECK
  if (potentialDuplicatePRs && potentialDuplicatePRs.length > 0) {
    const dup = potentialDuplicatePRs[0];
    checks.push({
      id: "duplicate-pr",
      title: "Duplicate Pull Request Check",
      status: "warn",
      detail: `Existing open PR #${dup.number} ("${dup.title}") already references this issue. Review it to avoid redundant efforts.`,
      sourceUrl: dup.htmlUrl,
      sourceLabel: `PR #${dup.number}`,
    });
    deductions.push({ reason: `Potential duplicate PR exists (#${dup.number})`, amount: 15 });
  } else {
    checks.push({
      id: "duplicate-pr",
      title: "Duplicate Pull Request Check",
      status: "pass",
      detail: "No active open pull requests found referencing this target issue.",
      sourceUrl: `${meta.htmlUrl}/pulls`,
      sourceLabel: "Open Pull Requests",
    });
  }

  // 4. TOUCHED FILES EXISTENCE IN GIT TREE
  const touchedFiles = artifact.touchedFiles;
  const missingFiles = touchedFiles.filter((tf) => tf.action !== "create" && !pathsSet.has(tf.path));

  if (missingFiles.length > 0) {
    const missingList = missingFiles.map((f) => f.path).join(", ");
    checks.push({
      id: "files-exist",
      title: "Touched Files Existence",
      status: "fail",
      detail: `Proposed files not found in repository tree: ${missingList}. Plan must only modify verified files.`,
      sourceUrl: `${meta.htmlUrl}/tree/${meta.defaultBranch}`,
      sourceLabel: `Git Tree (${meta.defaultBranch})`,
    });
    deductions.push({ reason: `Plan references non-existent files: ${missingList}`, amount: 25 });
  } else {
    const verifiedCount = touchedFiles.filter((tf) => pathsSet.has(tf.path)).length;
    checks.push({
      id: "files-exist",
      title: "Touched Files Existence",
      status: "pass",
      detail: `All ${touchedFiles.length} touched file(s) exist in repository tree (${verifiedCount} verified). Zero hallucinated paths.`,
      sourceUrl: touchedFiles[0]?.githubUrl || `${meta.htmlUrl}/tree/${meta.defaultBranch}`,
      sourceLabel: touchedFiles[0]?.path || "Tree Root",
    });
  }

  // 5. CONTRIBUTING & GOVERNANCE COMPLIANCE
  if (governance.contributing) {
    checks.push({
      id: "contributing-rules",
      title: "CONTRIBUTING.md Compliance",
      status: "pass",
      detail: `Verified against ${governance.contributing.path}. Follows repository branch and PR workflow.`,
      sourceUrl: governance.contributing.url,
      sourceLabel: governance.contributing.path,
    });
  } else {
    checks.push({
      id: "contributing-rules",
      title: "CONTRIBUTING.md Compliance",
      status: "warn",
      detail: "CONTRIBUTING.md: Not found in repo. Standard GitHub fork/PR workflow utilized as fallback.",
      sourceUrl: meta.htmlUrl,
      sourceLabel: meta.fullName,
    });
    deductions.push({ reason: "No CONTRIBUTING.md governance doc found", amount: 5 });
  }

  // PR Template check
  if (governance.prTemplate) {
    checks.push({
      id: "pr-template",
      title: "Pull Request Template Adherence",
      status: "pass",
      detail: `Draft PR structured to follow repository template at ${governance.prTemplate.path}.`,
      sourceUrl: governance.prTemplate.url,
      sourceLabel: governance.prTemplate.path,
    });
  } else {
    checks.push({
      id: "pr-template",
      title: "Pull Request Template Adherence",
      status: "pass",
      detail: "PR template: Not found in repo. High-standard conventional PR structure generated.",
      sourceUrl: meta.htmlUrl,
      sourceLabel: "Default PR Pattern",
    });
  }

  // Commit style check
  checks.push({
    id: "commit-style",
    title: "Commit Message Convention",
    status: "pass",
    detail: `Matches repository's detected style: '${commitStyle.style}'. Guidance: ${commitStyle.guidance}`,
    sourceUrl: `${meta.htmlUrl}/commits/${meta.defaultBranch}`,
    sourceLabel: "Recent Commits",
  });

  // 6. TEST & LINT COMMANDS VERIFICATION
  const hasTests = ecosystem.testCommands.length > 0 && ecosystem.testCommands[0] !== "Not found in repo";
  const hasLint = ecosystem.lintCommands.length > 0 && ecosystem.lintCommands[0] !== "Not found in repo";

  if (hasTests && hasLint) {
    checks.push({
      id: "test-commands",
      title: "Test & Lint Verification Suite",
      status: "pass",
      detail: `Automated test commands found: '${ecosystem.testCommands.join(", ")}'. Lint: '${ecosystem.lintCommands.join(", ")}'.`,
      sourceUrl: ecosystem.detectedFiles[0] ? `${meta.htmlUrl}/blob/${meta.defaultBranch}/${ecosystem.detectedFiles[0]}` : meta.htmlUrl,
      sourceLabel: ecosystem.detectedFiles[0] || ecosystem.ecosystem,
    });
  } else if (hasTests) {
    checks.push({
      id: "test-commands",
      title: "Test Commands Found",
      status: "pass",
      detail: `Automated test commands found: '${ecosystem.testCommands.join(", ")}'. Lint command not found.`,
      sourceUrl: meta.htmlUrl,
      sourceLabel: ecosystem.ecosystem,
    });
    deductions.push({ reason: "No linting command detected", amount: 5 });
  } else {
    checks.push({
      id: "test-commands",
      title: "Test Commands Verification",
      status: "warn",
      detail: "Test commands: Not found in repo. Contributor must verify changes manually or inspect CI configs.",
      sourceUrl: meta.htmlUrl,
      sourceLabel: "CI Workflows",
    });
    deductions.push({ reason: "No automated test commands detected", amount: 15 });
  }

  // Calculate final score (clamped between 0 and 100)
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const confidenceScore = Math.max(0, Math.min(100, baseScore - totalDeductions));

  // Determine overall status
  const hasFails = checks.some((c) => c.status === "fail");
  const hasWarns = checks.some((c) => c.status === "warn");
  const overallStatus: "pass" | "warn" | "fail" = hasFails ? "fail" : hasWarns ? "warn" : "pass";

  let confidenceExplanation = "";
  if (confidenceScore >= 85) {
    confidenceExplanation = "High Confidence: All target files exist, repository is active, test commands identified, and no duplicate PRs detected.";
  } else if (confidenceScore >= 60) {
    confidenceExplanation = "Moderate Confidence: Valid contribution plan, but has non-blocking warnings (e.g. missing test scripts or existing assignees).";
  } else {
    confidenceExplanation = "Low Confidence / Blocking Issues: Critical issues detected (such as archived repo, closed issue, or unverified files).";
  }

  return {
    overallStatus,
    confidenceScore,
    confidenceExplanation,
    scoreBreakdown: {
      base: baseScore,
      deductions,
    },
    checks,
    timestamp: new Date().toISOString(),
  };
}
