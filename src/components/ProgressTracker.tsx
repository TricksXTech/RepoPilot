"use client";

import { Check, Loader2 } from "lucide-react";

interface ProgressTrackerProps {
  stage: "idle" | "validating" | "evidence" | "generating" | "verifying" | "complete" | "error";
  percent: number;
  message: string;
}

const PHASES = [
  { id: "evidence", label: "Evidence", minPercent: 10 },
  { id: "artifact", label: "Artifact", minPercent: 50 },
  { id: "verification", label: "Verification", minPercent: 80 },
];

export function ProgressTracker({ stage, percent, message }: ProgressTrackerProps) {
  if (stage === "idle") return null;

  const isComplete = stage === "complete";
  const isError = stage === "error";

  return (
    <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-all">
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="flex items-center justify-between text-xs">
          {/* Phase Indicators */}
          <div className="flex items-center gap-4 sm:gap-6">
            {PHASES.map((phase, idx) => {
              const active = percent >= phase.minPercent && !isComplete && !isError;
              const done = percent > phase.minPercent + 25 || isComplete;

              return (
                <div key={phase.id} className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                      done
                        ? "bg-emerald-600 text-white"
                        : active
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {done ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : active ? (
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      active || done
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {phase.label}
                  </span>
                  {idx < PHASES.length - 1 && (
                    <span className="text-zinc-300 dark:text-zinc-700 select-none">→</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Status / Percentage */}
          <div className="hidden sm:flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <span className="truncate max-w-xs">{message}</span>
            <span className="font-mono text-zinc-400 dark:text-zinc-500">• {percent}%</span>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out rounded-full ${
              isError ? "bg-rose-500" : "bg-emerald-600 dark:bg-emerald-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
