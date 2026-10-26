"use client";

import { useState } from "react";
import { Search, Loader2, X, ArrowRight } from "lucide-react";

interface SearchBarProps {
  onAnalyze: (url: string, issueNumber?: number) => void;
  isLoading: boolean;
}

const EXAMPLE_REPOS = [
  { label: "colinhacks/zod", url: "https://github.com/colinhacks/zod", desc: "TypeScript" },
  { label: "expressjs/express", url: "https://github.com/expressjs/express", desc: "Node.js" },
  { label: "rust-lang/git2-rs", url: "https://github.com/rust-lang/git2-rs", desc: "Rust" },
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

  const selectExample = (exUrl: string) => {
    setUrl(exUrl);
    setIssueNumber("");
    onAnalyze(exUrl);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          {/* Main URL Input */}
          <div className="flex-1 relative flex items-center min-h-[48px] px-3">
            <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2.5 pointer-events-none" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com/owner/repo or paste issue URL"
              className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              disabled={isLoading}
              required
              aria-label="Repository or Issue URL"
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Optional Issue Number */}
          <div className="w-full sm:w-32 flex items-center border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 px-3 py-1.5 sm:py-0">
            <span className="text-xs text-zinc-400 font-mono mr-1">#</span>
            <input
              type="number"
              min="1"
              max="10000000"
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              placeholder="Issue #"
              className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              disabled={isLoading}
              aria-label="Optional Issue Number"
            />
          </div>

          {/* Analyze Button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* 3 Example Repository Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
        <span className="text-zinc-400 dark:text-zinc-500">Try an example:</span>
        {EXAMPLE_REPOS.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => selectExample(ex.url)}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono transition-colors flex items-center gap-1.5 min-h-[36px]"
          >
            <span>{ex.label}</span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-sans">
              {ex.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
