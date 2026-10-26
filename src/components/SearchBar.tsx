"use client";

import { useState } from "react";
import { Search, Sparkles, Loader2, X, ArrowRight } from "lucide-react";

interface SearchBarProps {
  onAnalyze: (url: string, issueNumber?: number) => void;
  isLoading: boolean;
}

const EXAMPLE_REPOS = [
  { label: "colinhacks/zod", url: "https://github.com/colinhacks/zod", issue: undefined, desc: "TypeScript" },
  { label: "expressjs/express", url: "https://github.com/expressjs/express", issue: undefined, desc: "Node.js" },
  { label: "rust-lang/git2-rs", url: "https://github.com/rust-lang/git2-rs", issue: undefined, desc: "Rust" },
  { label: "psf/requests", url: "https://github.com/psf/requests", issue: undefined, desc: "Python" },
];

export function SearchBar({ onAnalyze, isLoading }: SearchBarProps) {
  const [url, setUrl] = useState("");
  const [issueNumber, setIssueNumber] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    const parsedIssue = issueNumber.trim() ? parseInt(issueNumber.trim(), 10) : undefined;
    onAnalyze(url.trim(), parsedIssue);
  };

  const selectExample = (exUrl: string, exIssue?: number) => {
    setUrl(exUrl);
    setIssueNumber(exIssue ? exIssue.toString() : "");
    onAnalyze(exUrl, exIssue);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
          {/* Main URL Input */}
          <div className="flex-1 relative flex items-center min-h-[48px]">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste public GitHub repo URL (e.g. https://github.com/owner/repo or owner/repo#123)"
              className="w-full pl-11 pr-9 py-2.5 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              disabled={isLoading}
              required
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Clear URL"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Optional Issue Number Input */}
          <div className="w-full sm:w-36 flex items-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-xs text-slate-400 font-mono mr-1.5">#</span>
            <input
              type="number"
              min="1"
              max="10000000"
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              placeholder="Issue (opt)"
              className="w-full py-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all min-h-[48px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze Repo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example Repository Quick Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Try an example:
        </span>
        {EXAMPLE_REPOS.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => selectExample(ex.url, ex.issue)}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 min-h-[36px]"
          >
            <span className="font-mono">{ex.label}</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {ex.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
