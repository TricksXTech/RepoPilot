"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { EvidenceCard } from "@/components/EvidenceCard";
import { ContributionArtifactCard } from "@/components/ContributionArtifactCard";
import { VerificationReportCard } from "@/components/VerificationReportCard";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { NextStepsGuide } from "@/components/NextStepsGuide";
import { RepoEvidence, ContributionArtifact, VerificationReport, AnalysisPayload } from "@/lib/types";
import {
  Lock,
  Database,
  UserX,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [stage, setStage] = useState<"idle" | "validating" | "evidence" | "generating" | "verifying" | "complete" | "error">("idle");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [evidence, setEvidence] = useState<RepoEvidence | null>(null);
  const [artifact, setArtifact] = useState<ContributionArtifact | null>(null);
  const [verification, setVerification] = useState<VerificationReport | null>(null);

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<"evidence" | "artifact" | "verification">("evidence");

  const startAnalysis = async (url: string, issueNumber?: number) => {
    setCurrentUrl(url);
    setStage("validating");
    setProgressPercent(10);
    setStatusMessage("Validating repository URL...");
    setErrorMessage(null);
    setEvidence(null);
    setArtifact(null);
    setVerification(null);
    setMobileTab("evidence");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, issueNumber }),
      });

      if (!response.ok && !response.body) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to establish streaming connection.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const data: AnalysisPayload = JSON.parse(trimmed.slice(6));

            if (data.stage) setStage(data.stage);
            if (data.progressPercent !== undefined) setProgressPercent(data.progressPercent);
            if (data.message) setStatusMessage(data.message);

            if (data.evidence) setEvidence(data.evidence);
            if (data.artifact) {
              setArtifact(data.artifact);
              setMobileTab("artifact");
            }
            if (data.verification) setVerification(data.verification);

            if (data.stage === "error") {
              setErrorMessage(data.error?.message || "An unexpected error occurred.");
            }
          } catch {
            // Ignore malformed chunk
          }
        }
      }
    } catch (err: unknown) {
      setStage("error");
      setProgressPercent(0);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to connect to RepoPilot agent service."
      );
    }
  };

  const handleSelectSuggestedIssue = (issueNum: number) => {
    if (!currentUrl) return;
    startAnalysis(currentUrl, issueNum);
  };

  const isLoading = stage !== "idle" && stage !== "complete" && stage !== "error";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* Hero Section with gentle fade-up animation */}
        <div className="text-center max-w-2xl mx-auto space-y-4 animate-hero-fade">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            Good first contributions,{" "}
            <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/30 decoration-wavy decoration-2">
              verified by evidence
            </span>
            .
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Find a beginner-friendly issue and get a step-by-step plan to fix it—with exact files to touch, a suggested diff, and ready-to-run git commands.
          </p>

          {/* Search Bar with 3 Chips and Helper */}
          <div className="pt-2">
            <SearchBar onAnalyze={startAnalysis} isLoading={isLoading} />
          </div>

          {/* Small Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-2 text-xs text-zinc-400 dark:text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              <span>Read-only</span>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 select-none">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              <span>No data stored</span>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 select-none">•</span>
            <span className="inline-flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              <span>No sign-up</span>
            </span>
          </div>
        </div>

        {/* Sticky Step Progress Indicator */}
        <ProgressTracker stage={stage} percent={progressPercent} message={statusMessage} />

        {/* Error State with Clear Message & Try Again Button */}
        {errorMessage && (
          <div className="w-full max-w-2xl mx-auto p-5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-900 dark:text-rose-200 text-sm animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Analysis Issue</span>
                <p className="text-xs text-rose-700 dark:text-rose-300">{errorMessage}</p>
              </div>
            </div>
            {currentUrl && (
              <button
                onClick={() => startAnalysis(currentUrl)}
                className="shrink-0 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            )}
          </div>
        )}

        {/* Skeleton Loaders (while loading and no evidence yet) */}
        {isLoading && !evidence && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse pt-4">
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
              <div className="h-6 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-850 rounded" />
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="h-10 bg-zinc-100 dark:bg-zinc-850 rounded" />
                <div className="h-10 bg-zinc-100 dark:bg-zinc-850 rounded" />
                <div className="h-10 bg-zinc-100 dark:bg-zinc-850 rounded" />
                <div className="h-10 bg-zinc-100 dark:bg-zinc-850 rounded" />
              </div>
            </div>
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center space-y-3 min-h-[220px]">
              <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-850" />
              <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-850 rounded" />
            </div>
          </div>
        )}

        {/* Results Experience */}
        {evidence && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Mobile Tabs Bar: Evidence | Artifact | Verification */}
            <div className="block lg:hidden">
              <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setMobileTab("evidence")}
                  className={`flex-1 py-2.5 text-center text-xs font-medium border-b-2 transition-colors ${
                    mobileTab === "evidence"
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Evidence
                </button>
                <button
                  onClick={() => setMobileTab("artifact")}
                  className={`flex-1 py-2.5 text-center text-xs font-medium border-b-2 transition-colors ${
                    mobileTab === "artifact"
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Artifact {artifact && "•"}
                </button>
                <button
                  onClick={() => setMobileTab("verification")}
                  className={`flex-1 py-2.5 text-center text-xs font-medium border-b-2 transition-colors ${
                    mobileTab === "verification"
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Verification {verification && `(${verification.confidenceScore})`}
                </button>
              </div>

              {/* Mobile Tab Content */}
              <div className="pt-4">
                {mobileTab === "evidence" && (
                  <EvidenceCard evidence={evidence} onSelectIssue={handleSelectSuggestedIssue} />
                )}
                {mobileTab === "artifact" && (
                  artifact ? (
                    <div className="space-y-6">
                      <ContributionArtifactCard artifact={artifact} evidence={evidence} />
                      <NextStepsGuide forkUrl={artifact.gitChecklist.forkUrl} repoName={evidence.meta.repo} />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-zinc-400 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      Synthesizing contribution artifact...
                    </div>
                  )
                )}
                {mobileTab === "verification" && (
                  verification ? (
                    <VerificationReportCard report={verification} />
                  ) : (
                    <div className="p-8 text-center text-xs text-zinc-400 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      Auditing claims and calculating confidence score...
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Desktop Experience: Two Columns for Evidence & Verification, Full Width for Artifact */}
            <div className="hidden lg:block space-y-6">
              <div className="grid grid-cols-2 gap-6 items-start">
                <EvidenceCard evidence={evidence} onSelectIssue={handleSelectSuggestedIssue} />
                {verification ? (
                  <VerificationReportCard report={verification} />
                ) : (
                  <div className="p-8 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 flex flex-col items-center justify-center text-center space-y-2 min-h-[280px]">
                    <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
                    <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Running Deterministic Verification Checks...
                    </div>
                    <p className="text-[11px] text-zinc-400 max-w-xs">
                      Matching touched files with tree paths, checking duplicate PRs, and auditing CONTRIBUTING compliance.
                    </p>
                  </div>
                )}
              </div>

              {artifact && (
                <div className="w-full space-y-6">
                  <ContributionArtifactCard artifact={artifact} evidence={evidence} />
                  <NextStepsGuide forkUrl={artifact.gitChecklist.forkUrl} repoName={evidence.meta.repo} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <HowItWorks />

        {/* FAQ Section */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
