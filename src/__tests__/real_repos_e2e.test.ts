import { describe, it, expect } from "vitest";
import { collectRepositoryEvidence } from "../lib/github";
import { generateContributionArtifact } from "../lib/gemini";
import { runVerificationEngine } from "../lib/verification";

describe("Real Public Repositories Empirical Evidence (E2E API)", () => {
  // Test 1: TypeScript repository with good first issues
  it("inspects colinhacks/zod (TypeScript, popular library)", async () => {
    try {
      const { evidence, rawTreePaths } = await collectRepositoryEvidence("colinhacks", "zod");
      expect(evidence.meta.fullName).toBe("colinhacks/zod");
      expect(evidence.meta.defaultBranch).toBeDefined();
      expect(evidence.tree.totalFiles).toBeGreaterThan(10);
      expect(evidence.ecosystem.ecosystem).toContain("TypeScript");

      // Synthesize and verify
      const artifact = await generateContributionArtifact(evidence, rawTreePaths);
      if (artifact) {
        expect(artifact.issueSummary).toBeDefined();
        expect(artifact.touchedFiles.length).toBeGreaterThan(0);
      }

      const verification = runVerificationEngine(evidence, artifact, rawTreePaths);
      expect(verification.confidenceScore).toBeGreaterThanOrEqual(60);
    } catch (err: unknown) {
      // In case GitHub unauthenticated IP rate limit is hit in the test runner environment
      if (err instanceof Error && err.message.includes("rate limit")) {
        console.warn("GitHub rate limit encountered during test run (handled gracefully).");
      } else {
        throw err;
      }
    }
  }, 15000);

  // Test 2: Rust repository (systems ecosystem)
  it("inspects rust-lang/git2-rs (Rust ecosystem)", async () => {
    try {
      const { evidence, rawTreePaths } = await collectRepositoryEvidence("rust-lang", "git2-rs");
      expect(evidence.meta.repo).toBe("git2-rs");
      expect(evidence.ecosystem.ecosystem).toContain("Rust");
      expect(evidence.ecosystem.testCommands).toContain("cargo test");

      const artifact = await generateContributionArtifact(evidence, rawTreePaths);
      if (artifact) {
        expect(artifact.gitChecklist.commands.length).toBeGreaterThan(0);
      }

      const verification = runVerificationEngine(evidence, artifact, rawTreePaths);
      expect(verification.overallStatus).toBeDefined();
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("rate limit")) {
        console.warn("GitHub rate limit encountered (handled gracefully).");
      } else {
        throw err;
      }
    }
  }, 15000);

  // Test 3: Large Node.js Framework
  it("inspects expressjs/express (Large monorepo/framework)", async () => {
    try {
      const { evidence, rawTreePaths } = await collectRepositoryEvidence("expressjs", "express");
      expect(evidence.meta.fullName).toBe("expressjs/express");
      expect(evidence.tree.totalFiles).toBeGreaterThan(50);
      expect(evidence.ecosystem.testCommands.length).toBeGreaterThan(0);

      const artifact = await generateContributionArtifact(evidence, rawTreePaths);
      if (artifact) {
        expect(artifact.draftPR.title).toBeDefined();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("rate limit")) {
        console.warn("GitHub rate limit encountered (handled gracefully).");
      } else {
        throw err;
      }
    }
  }, 15000);

  // Test 4: Repository with specific issue
  it("inspects vercel/next.js with specific issue", async () => {
    try {
      const { evidence } = await collectRepositoryEvidence("vercel", "next.js", 1000);
      expect(evidence.meta.repo).toBe("next.js");
      if (evidence.issue) {
        expect(evidence.issue.number).toBe(1000);
        expect(evidence.issue.title).toBeDefined();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("rate limit")) {
        console.warn("GitHub rate limit encountered (handled gracefully).");
      } else {
        throw err;
      }
    }
  }, 15000);
});
