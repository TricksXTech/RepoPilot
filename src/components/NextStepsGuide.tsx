"use client";

import { GitFork, GitBranch, Play, GitPullRequest, ArrowRight } from "lucide-react";

interface NextStepsGuideProps {
  forkUrl: string;
  repoName: string;
}

export function NextStepsGuide({ forkUrl, repoName }: NextStepsGuideProps) {
  const steps = [
    {
      icon: GitFork,
      title: "1. Fork the repository",
      desc: "Click 'Fork' on GitHub to create your own copy of the project. You'll make your edits there.",
      actionText: "Open Fork Page",
      actionUrl: forkUrl,
    },
    {
      icon: GitBranch,
      title: "2. Create a feature branch",
      desc: "Run the branch checkout command from the checklist above so your work stays cleanly separated.",
    },
    {
      icon: Play,
      title: "3. Run tests locally",
      desc: "Execute the detected test command before opening your PR to ensure your changes pass all checks.",
    },
    {
      icon: GitPullRequest,
      title: "4. Submit your Pull Request",
      desc: "Push your branch and click 'New Pull Request' on GitHub using the pre-written title and description.",
    },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/60 dark:border-emerald-800/60 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>Next steps: How to use this plan</span>
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          New to open source? Follow these 4 straightforward steps to submit your contribution to {repoName}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5 shadow-sm"
            >
              <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">{st.title}</div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">{st.desc}</p>
              {st.actionUrl && (
                <div className="pt-1">
                  <a
                    href={st.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    <span>{st.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
