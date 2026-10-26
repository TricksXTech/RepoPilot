"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { VerificationReport } from "@/lib/types";
import { JargonTooltip } from "./JargonTooltip";

interface VerificationReportCardProps {
  report: VerificationReport;
}

export function VerificationReportCard({ report }: VerificationReportCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { overallStatus, confidenceScore, confidenceExplanation, scoreBreakdown, checks } = report;

  // SVG Radial Circle calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidenceScore / 100) * circumference;

  const scoreColor =
    confidenceScore >= 80
      ? "text-emerald-500 stroke-emerald-500"
      : confidenceScore >= 60
      ? "text-amber-500 stroke-amber-500"
      : "text-rose-500 stroke-rose-500";

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* 1. Circular Confidence Meter at the Top */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 pb-5 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className={`${scoreColor} transition-all duration-1000 ease-out`}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              {confidenceScore}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase font-medium">
              <JargonTooltip term="confidence">Confidence</JargonTooltip>
            </span>
          </div>
        </div>

        <div className="space-y-1 max-w-sm">
          <div className="flex items-center justify-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${
                overallStatus === "pass"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                  : overallStatus === "warn"
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
              }`}
            >
              {overallStatus} status
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {confidenceExplanation}
          </p>
        </div>

        {/* Score Breakdown toggle */}
        {scoreBreakdown.deductions.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 inline-flex items-center gap-1 font-medium transition-colors"
            >
              <span>{showBreakdown ? "Hide" : "Show"} score deduction details</span>
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showBreakdown && (
              <div className="mt-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800 text-left text-xs space-y-1.5 w-full max-w-sm animate-in fade-in">
                <div className="flex justify-between text-zinc-400 font-medium">
                  <span>Base Score</span>
                  <span>100 pts</span>
                </div>
                {scoreBreakdown.deductions.map((d, i) => (
                  <div key={i} className="flex justify-between text-rose-600 dark:text-rose-400 text-[11px]">
                    <span>- {d.reason}</span>
                    <span>-{d.amount} pts</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-zinc-900 dark:text-zinc-100 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <span>Final Confidence Score</span>
                  <span>{confidenceScore} / 100</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Pass / Warn / Fail Checklist with Icons */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Verification Checklist ({checks.length})
        </span>

        <div className="space-y-2">
          {checks.map((chk) => (
            <div
              key={chk.id}
              className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/30 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {chk.status === "pass" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : chk.status === "warn" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{chk.title}</div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    {chk.detail}
                  </div>
                </div>
              </div>

              {/* Source Link */}
              {chk.sourceUrl && (
                <div className="shrink-0 pt-0.5">
                  <a
                    href={chk.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 font-mono text-[10px]"
                    title={chk.sourceUrl}
                  >
                    <span>{chk.sourceLabel || "Source"}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
