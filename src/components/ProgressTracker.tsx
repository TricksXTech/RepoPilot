"use client";

import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";

interface ProgressTrackerProps {
  stage: "idle" | "validating" | "evidence" | "generating" | "verifying" | "complete" | "error";
  percent: number;
  message: string;
}

const STAGES = [
  { id: "validating", label: "Validating" },
  { id: "evidence", label: "Evidence" },
  { id: "generating", label: "Synthesizing" },
  { id: "verifying", label: "Verifying" },
  { id: "complete", label: "Ready" },
];

export function ProgressTracker({ stage, percent, message }: ProgressTrackerProps) {
  if (stage === "idle") return null;

  const getStageIndex = (s: string) => {
    switch (s) {
      case "validating": return 0;
      case "evidence": return 1;
      case "generating": return 2;
      case "verifying": return 3;
      case "complete": return 4;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(stage);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-300">
      {/* Header and Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            {stage === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : stage === "complete" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            )}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {stage === "error" ? "Analysis Interrupted" : message || "Processing repository..."}
            </span>
          </div>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {percent}%
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              stage === "error"
                ? "bg-rose-500"
                : "bg-gradient-to-r from-emerald-600 to-teal-400"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Step Pills */}
      <div className="grid grid-cols-5 gap-1 pt-1 text-center">
        {STAGES.map((s, index) => {
          const isDone = currentIndex > index || stage === "complete";
          const isCurrent = currentIndex === index && stage !== "complete" && stage !== "error";

          return (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium tracking-tight truncate w-full ${
                  isCurrent
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : isDone
                    ? "text-slate-700 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-600"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
