"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { EvidenceCard } from "@/components/EvidenceCard";
import { ContributionArtifactCard } from "@/components/ContributionArtifactCard";
import { VerificationReportCard } from "@/components/VerificationReportCard";
import { RepoEvidence, ContributionArtifact, VerificationReport, AnalysisPayload } from "@/lib/types";
import {
  ShieldCheck,
  Sparkles,
  AlertOctagon,
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

  const startAnalysis = async (url: string, issueNumber?: number) => {
    setCurrentUrl(url);
    setStage("validating");
    setProgressPercent(10);
    setStatusMessage("Validating repository URL...");
    setErrorMessage(null);
    setEvidence(null);
    setArtifact(null);
    setVerification(null);

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
            if (data.artifact) setArtifact(data.artifact);
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Hackathon Track PS04 • Open-Source Contribution & Developer Workflow Agent
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Make your next open-source contribution with <span className="text-emerald-600 dark:text-emerald-400">empirical confidence</span>.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            RepoPilot inspects real GitHub evidence, matches CONTRIBUTING guidelines, detects build & test commands, and synthesizes a verified contribution plan with a unified diff and draft PR. Zero cloning. Zero code execution.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar onAnalyze={startAnalysis} isLoading={isLoading} />

        {/* Progress Tracker */}
        <ProgressTracker stage={stage} percent={progressPercent} message={statusMessage} />

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm animate-in fade-in">
            <AlertOctagon className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block">Analysis Issue:</strong>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Analysis Results View */}
        {evidence && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top row: Evidence + Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Evidence Card */}
              <div className="space-y-6">
                <EvidenceCard evidence={evidence} onSelectIssue={handleSelectSuggestedIssue} />
              </div>

              {/* Verification Report Card */}
              <div className="space-y-6">
                {verification ? (
                  <VerificationReportCard report={verification} />
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                    <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-pulse" />
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Running Deterministic Verification Checks...
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Matching touched files with tree paths, checking duplicate PRs, and auditing CONTRIBUTING compliance.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row: Contribution Artifact Card (Full Width) */}
            {artifact && (
              <div className="w-full">
                <ContributionArtifactCard artifact={artifact} evidence={evidence} />
              </div>
            )}
          </div>
        )}

        {/* Empty State / Feature Highlights (when idle) */}
        {stage === "idle" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Repository Evidence
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Queries GitHub REST API (recursive tree, governance files, CI workflows, test commands, commit style) with zero code execution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Contribution Artifact
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Generates a plain-language summary, exact file plan, suggested unified diff, repo-templated PR draft, and git CLI checklist.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Empirical Verification
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Verifies every claimed file exists in git tree, checks for duplicate open PRs, verifies test commands, and scores confidence (0-100).
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
