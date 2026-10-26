"use client";

import { Link2, SearchCheck, CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Link2,
      title: "Paste a GitHub link",
      description:
        "Enter any public repository URL or issue link. No account, no login, and no configuration required.",
    },
    {
      number: "02",
      icon: SearchCheck,
      title: "RepoPilot gathers proof",
      description:
        "We inspect real files, test commands, and contributing rules via GitHub's read-only API with zero cloning.",
    },
    {
      number: "03",
      icon: CheckCircle2,
      title: "Get your contribution plan",
      description:
        "Receive a ready-to-use plan with verified files, a suggested diff, PR draft, and git checklist.",
    },
  ];

  return (
    <section className="py-8 space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          How it works
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          From an open GitHub issue to your first accepted pull request in three easy steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 shadow-sm hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs font-semibold text-zinc-300 dark:text-zinc-700">
                  {step.number}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {step.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
