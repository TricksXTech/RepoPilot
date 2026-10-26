"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { VerificationReport } from "@/lib/types";

interface VerificationReportCardProps {
  report: VerificationReport;
}

export function VerificationReportCard({ report }: VerificationReportCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { overallStatus, confidenceScore, confidenceExplanation, scoreBreakdown, checks } = report;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40";
    if (score >= 60) return "text-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-950/40";
    return "text-rose-500 border-rose-500 bg-rose-50 dark:bg-rose-950/40";
  };

  const getStatusBadge = (status: "pass" | "warn" | "fail") => {
    switch (status) {
      case "pass":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pass
          </span>
        );
      case "warn":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Warn
          </span>
        );
      case "fail":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Fail
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* 1. Score & Overall Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Verification Engine Report
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Automated verification of claims against empirical GitHub repository evidence.
          </p>
        </div>

        {/* Confidence Meter Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Confidence Score
            </span>
            <div className="text-xs text-slate-500 capitalize">{overallStatus} Status</div>
          </div>
          <div
            className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-xl shadow-sm ${getScoreColor(
              confidenceScore
            )}`}
          >
            <span>{confidenceScore}</span>
            <span className="text-[10px] font-normal leading-none">/ 100</span>
          </div>
        </div>
      </div>

      {/* 2. Confidence Explanation & Score Deduction Toggle */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
            {confidenceExplanation}
          </p>
          {scoreBreakdown.deductions.length > 0 && (
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 flex items-center gap-1 font-medium"
            >
              {showBreakdown ? "Hide" : "Show"} Breakdown{" "}
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Deductions breakdown */}
        {showBreakdown && scoreBreakdown.deductions.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300">Score Calculations:</div>
            <div className="flex justify-between text-slate-500">
              <span>Base score</span>
              <span>100 pts</span>
            </div>
            {scoreBreakdown.deductions.map((d, i) => (
              <div key={i} className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>- {d.reason}</span>
                <span>-{d.amount} pts</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Final score</span>
              <span>{confidenceScore} / 100</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Itemized Verification Checks (Pass / Warn / Fail) */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Audited Verification Checks ({checks.length})
        </h3>
        <div className="space-y-2.5">
          {checks.map((chk) => (
            <div
              key={chk.id}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusBadge(chk.status)}
                  <h4 className="font-semibold text-slate-900 dark:text-white">{chk.title}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {chk.detail}
                </p>
              </div>

              {/* Source Link */}
              {chk.sourceUrl && (
                <div className="shrink-0 text-left sm:text-right">
                  <a
                    href={chk.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline max-w-[220px] truncate"
                    title={chk.sourceUrl}
                  >
                    <span>{chk.sourceLabel || "Source Link"}</span>
                    <ExternalLink className="w-3 h-3" />
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
