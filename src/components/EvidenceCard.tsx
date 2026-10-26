"use client";

import {
  GitFork,
  Star,
  FileText,
  ShieldAlert,
  CheckCircle,
  XCircle,
  ExternalLink,
  Terminal,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { RepoEvidence } from "@/lib/types";

interface EvidenceCardProps {
  evidence: RepoEvidence;
  onSelectIssue?: (issueNumber: number) => void;
}

export function EvidenceCard({ evidence, onSelectIssue }: EvidenceCardProps) {
  const { meta, languages, governance, ecosystem, commitStyle, issue, suggestedIssues, tree } = evidence;

  // Compute top language
  const languageEntries = Object.entries(languages);
  const totalLangBytes = languageEntries.reduce((sum, [, b]) => sum + b, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* 1. Header: Repo Info & Quick Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {meta.fullName}
            </h2>
            {meta.isArchived && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 rounded-md border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Archived
              </span>
            )}
            {meta.isFork && (
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                Fork
              </span>
            )}
            {meta.license && (
              <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                {meta.license.name}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {meta.description || "No repository description provided."}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-slate-900 dark:text-white">{meta.stars.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg">
            <GitFork className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-900 dark:text-white">{meta.forks.toLocaleString()}</span>
          </div>
          <a
            href={meta.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Open on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 2. Language Breakdown Bar */}
      {languageEntries.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Languages</span>
            <span>Default branch: <code className="font-mono text-emerald-600 dark:text-emerald-400">{meta.defaultBranch}</code></span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 gap-0.5">
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
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            {languageEntries.slice(0, 4).map(([lang, bytes], i) => {
              const pct = totalLangBytes > 0 ? ((bytes / totalLangBytes) * 100).toFixed(1) : "0";
              const dots = ["text-emerald-500", "text-teal-500", "text-cyan-500", "text-indigo-500"];
              return (
                <span key={lang} className="inline-flex items-center gap-1">
                  <span className={`text-base ${dots[i % dots.length]}`}>•</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{lang}</span>
                  <span>{pct}%</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Governance Evidence Checklist */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Repository Governance & Templates
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* README */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">README</span>
            {governance.readme ? (
              <a
                href={governance.readme.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Found
              </a>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> None
              </span>
            )}
          </div>

          {/* CONTRIBUTING */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">CONTRIBUTING</span>
            {governance.contributing ? (
              <a
                href={governance.contributing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Found
              </a>
            ) : (
              <span className="text-amber-500 flex items-center gap-1" title="Not found in repo">
                <AlertTriangle className="w-3.5 h-3.5" /> Absent
              </span>
            )}
          </div>

          {/* PR Template */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">PR Template</span>
            {governance.prTemplate ? (
              <a
                href={governance.prTemplate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Found
              </a>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> None
              </span>
            )}
          </div>

          {/* Code of Conduct */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">Code of Conduct</span>
            {governance.codeOfConduct ? (
              <a
                href={governance.codeOfConduct.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Found
              </a>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> None
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Ecosystem & CI/CD Evidence */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-900 dark:text-white">
              Ecosystem: {ecosystem.ecosystem}
            </span>
            {ecosystem.packageManager && (
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono">
                {ecosystem.packageManager}
              </span>
            )}
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Git Tree: <strong className="text-slate-700 dark:text-slate-300">{tree.totalFiles.toLocaleString()}</strong> files indexed
          </div>
        </div>

        {/* Commands */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Test Command</span>
            <div className="font-mono text-emerald-700 dark:text-emerald-300 truncate">
              {ecosystem.testCommands[0] || "Not found in repo"}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Lint Command</span>
            <div className="font-mono text-cyan-700 dark:text-cyan-300 truncate">
              {ecosystem.lintCommands[0] || "Not found in repo"}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Commit Convention</span>
            <div className="font-mono text-indigo-700 dark:text-indigo-300 capitalize truncate">
              {commitStyle.style}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Issue Evidence: Either Selected Issue OR Good First Issues Picker */}
      {issue ? (
        <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                #{issue.number} {issue.state}
              </span>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                {issue.title}
              </h4>
            </div>
            <a
              href={issue.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Open on GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {issue.body && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 font-sans">
              {issue.body}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Author: @{issue.author}</span>
            <span>•</span>
            <span>
              Assignees: {issue.assignees.length > 0 ? `@${issue.assignees.join(", @")}` : "None (Available)"}
            </span>
            <span>•</span>
            <span>Comments: {issue.commentsCount}</span>
          </div>
        </div>
      ) : suggestedIssues.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Suggested &quot;Good First Issues&quot; ({suggestedIssues.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click to synthesize plan</span>
          </div>

          <div className="space-y-2">
            {suggestedIssues.map((sug) => (
              <div
                key={sug.number}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      #{sug.number}
                    </span>
                    <a
                      href={sug.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-900 dark:text-white hover:underline flex items-center gap-1"
                    >
                      {sug.title}
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sug.reason}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onSelectIssue && (
                    <button
                      onClick={() => onSelectIssue(sug.number)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm min-h-[36px]"
                    >
                      Select Issue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
