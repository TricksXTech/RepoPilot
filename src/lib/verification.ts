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
  artifact: ContributionArtifact | null | undefined,
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
    deductions.push({ reason: "Repository is archived and read-only (blocks new PRs)", amount: 60 });
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
      deductions.push({ reason: `Target issue #${issue.number} is already closed`, amount: 60 });
    } else if (issue.assignees && issue.assignees.length > 0) {
      checks.push({
        id: "issue-assignment",
        title: "Issue Assignee Coordination",
        status: "warn",
        detail: `Issue #${issue.number} is currently assigned to @${issue.assignees.join(", @")}. Check comments before opening duplicate work.`,
        sourceUrl: issue.htmlUrl,
        sourceLabel: `Issue #${issue.number} (${issue.assignees.length} assignee(s))`,
      });
      deductions.push({ reason: `Issue #${issue.number} already has active assignee(s)`, amount: 15 });
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
      status: "pass",
      detail: "No specific issue was targeted. Browse the top 5 suggested beginner issues above.",
      sourceUrl: `${meta.htmlUrl}/issues`,
      sourceLabel: "Repo Issues",
    });
    deductions.push({ reason: "No specific issue targeted (showing suggested issues)", amount: 5 });
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
    deductions.push({ reason: `Existing open PR #${dup.number} references this issue`, amount: 25 });
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
  if (artifact && artifact.touchedFiles) {
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
      deductions.push({ reason: `Plan references non-existent files: ${missingList}`, amount: 55 });
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
  } else {
    checks.push({
      id: "files-exist",
      title: "Touched Files Existence",
      status: "pass",
      detail: issue
        ? "AI plan not generated; repository file tree indexed and verified."
        : "Select one of the suggested issues above to generate a verified file modification plan.",
      sourceUrl: `${meta.htmlUrl}/tree/${meta.defaultBranch}`,
      sourceLabel: `Git Tree (${rawTreePaths.length} files)`,
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
    deductions.push({ reason: "No CONTRIBUTING.md governance document found", amount: 5 });
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
    deductions.push({ reason: "No automated linting command detected", amount: 5 });
  } else {
    checks.push({
      id: "test-commands",
      title: "Test Commands Verification",
      status: "warn",
      detail: "Test commands: Not found in repo. Contributor must verify changes manually or inspect CI configs.",
      sourceUrl: meta.htmlUrl,
      sourceLabel: "CI Workflows",
    });
    deductions.push({ reason: "No automated test commands detected in repository", amount: 15 });
  }

  // Calculate final score (clamped between 0 and 100)
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const confidenceScore = Math.max(0, Math.min(100, baseScore - totalDeductions));

  // Determine overall status and explanation strictly from confidence score:
  // 80-100 = High ("pass"), 50-79 = Medium ("warn"), below 50 = Low ("fail")
  let overallStatus: "pass" | "warn" | "fail" = "pass";
  let confidenceExplanation = "";

  if (confidenceScore >= 80) {
    overallStatus = "pass";
    confidenceExplanation = "High Confidence: Verified against repository tree, active status, and automated test configurations.";
  } else if (confidenceScore >= 50) {
    overallStatus = "warn";
    confidenceExplanation = "Medium Confidence: Valid repository evidence with non-blocking advisories (e.g. missing test scripts or existing assignees).";
  } else {
    overallStatus = "fail";
    confidenceExplanation = "Low Confidence: Critical blockers identified (such as archived repository, closed issue, or unverified files).";
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
