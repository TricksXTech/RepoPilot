"use client";

import {
  GitFork,
  Star,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Terminal,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { RepoEvidence } from "@/lib/types";

interface EvidenceCardProps {
  evidence: RepoEvidence;
  onSelectIssue?: (issueNumber: number) => void;
}

export function EvidenceCard({ evidence, onSelectIssue }: EvidenceCardProps) {
  const { meta, languages, governance, ecosystem, commitStyle, issue, suggestedIssues, tree } = evidence;

  const languageEntries = Object.entries(languages);
  const totalLangBytes = languageEntries.reduce((sum, [, b]) => sum + b, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* 1. Header: Repo Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {meta.fullName}
            </h2>
            {meta.isArchived && (
              <span className="px-2 py-0.5 text-xs font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-md border border-rose-200 dark:border-rose-800/60 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Archived
              </span>
            )}
            {meta.license && (
              <span className="px-2 py-0.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md">
                {meta.license.name}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            {meta.description || "No description provided."}
          </p>
        </div>

        {/* Stars, Forks, External Link */}
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{meta.stars.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800">
            <GitFork className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{meta.forks.toLocaleString()}</span>
          </div>
          <a
            href={meta.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            aria-label="View on GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. Languages Bar */}
      {languageEntries.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Languages</span>
            <span className="font-mono text-[11px]">Branch: {meta.defaultBranch}</span>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 gap-0.5">
            {languageEntries.slice(0, 5).map(([lang, bytes], i) => {
              const pct = totalLangBytes > 0 ? (bytes / totalLangBytes) * 100 : 0;
              const colors = ["bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-indigo-500", "bg-purple-500"];
              return (
                <div
                  key={lang}
                  className={`h-full ${colors[i % colors.length]}`}
                  style={{ width: `${Math.max(2, pct)}%` }}
                  title={`${lang}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
            {languageEntries.slice(0, 4).map(([lang, bytes], i) => {
              const pct = totalLangBytes > 0 ? ((bytes / totalLangBytes) * 100).toFixed(1) : "0";
              const dots = ["text-emerald-500", "text-teal-500", "text-cyan-500", "text-indigo-500"];
              return (
                <span key={lang} className="inline-flex items-center gap-1">
                  <span className={dots[i % dots.length]}>•</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{lang}</span>
                  <span>{pct}%</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Governance Compact Cards with Green/Amber/Red Badges */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <FileText className="w-3 h-3" /> Governance &amp; Templates
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* README */}
          <div className="p-3 rounded-lg bg-zinc-50/70 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate mr-1">README</span>
            {governance.readme ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Found
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center gap-1 shrink-0">
                <XCircle className="w-3 h-3" /> None
              </span>
            )}
          </div>

          {/* CONTRIBUTING */}
          <div className="p-3 rounded-lg bg-zinc-50/70 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate mr-1">CONTRIBUTING</span>
            {governance.contributing ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Found
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center gap-1 shrink-0">
                <AlertTriangle className="w-3 h-3" /> Missing
              </span>
            )}
          </div>

          {/* PR Template */}
          <div className="p-3 rounded-lg bg-zinc-50/70 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate mr-1">PR Template</span>
            {governance.prTemplate ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Found
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center gap-1 shrink-0">
                <AlertTriangle className="w-3 h-3" /> None
              </span>
            )}
          </div>

          {/* Code of Conduct */}
          <div className="p-3 rounded-lg bg-zinc-50/70 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate mr-1">Code of Conduct</span>
            {governance.codeOfConduct ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Found
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center gap-1 shrink-0">
                <XCircle className="w-3 h-3" /> None
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Ecosystem & CI Commands */}
      <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-850/40 border border-zinc-200/60 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Ecosystem: {ecosystem.ecosystem}
            </span>
            {ecosystem.packageManager && (
              <span className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-750 text-zinc-600 dark:text-zinc-300 text-[10px] font-mono">
                {ecosystem.packageManager}
              </span>
            )}
          </div>
          <span className="text-[11px] text-zinc-400">
            {tree.totalFiles.toLocaleString()} files indexed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Test Command</div>
            <div className="font-mono text-emerald-600 dark:text-emerald-400 truncate text-[11px] mt-0.5">
              {ecosystem.testCommands[0] || "Not found in repo"}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Lint Command</div>
            <div className="font-mono text-cyan-600 dark:text-cyan-400 truncate text-[11px] mt-0.5">
              {ecosystem.lintCommands[0] || "Not found in repo"}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Commit Convention</div>
            <div className="font-mono text-indigo-600 dark:text-indigo-400 capitalize truncate text-[11px] mt-0.5">
              {commitStyle.style}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Issue Section */}
      {issue ? (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-600 text-white font-mono">
                #{issue.number}
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                {issue.title}
              </span>
            </div>
            <a
              href={issue.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {issue.body && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 bg-white/70 dark:bg-zinc-900/70 p-2.5 rounded border border-zinc-200/40 dark:border-zinc-800/60">
              {issue.body}
            </p>
          )}
        </div>
      ) : suggestedIssues.length > 0 ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Suggested First Issues ({suggestedIssues.length})
            </span>
            <span className="text-[10px] text-zinc-400">Select one to target</span>
          </div>

          <div className="space-y-1.5">
            {suggestedIssues.map((sug) => (
              <div
                key={sug.number}
                className="p-2.5 rounded-lg bg-zinc-50/60 hover:bg-zinc-100/80 dark:bg-zinc-850/40 dark:hover:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-800 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="truncate mr-2">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold mr-1.5">
                    #{sug.number}
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                    {sug.title}
                  </span>
                </div>
                {onSelectIssue && (
                  <button
                    onClick={() => onSelectIssue(sug.number)}
                    className="shrink-0 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition-colors min-h-[30px]"
                  >
                    Select
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
