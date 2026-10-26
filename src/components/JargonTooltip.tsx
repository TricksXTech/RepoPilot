"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface JargonTooltipProps {
  term: "fork" | "branch" | "pr" | "commit" | "diff" | "ci" | "confidence";
  children?: React.ReactNode;
}

const JARGON_DEFINITIONS: Record<string, { title: string; explanation: string }> = {
  fork: {
    title: "What is a Fork?",
    explanation:
      "Your personal copy of someone else's GitHub repository. You make edits in your fork without affecting their original code.",
  },
  branch: {
    title: "What is a Branch?",
    explanation:
      "An isolated workspace to make changes safely. Think of it like a new draft of a document before you save over the original.",
  },
  pr: {
    title: "What is a Pull Request (PR)?",
    explanation:
      "A formal proposal asking repository maintainers to review your work and pull your changes into the main project.",
  },
  commit: {
    title: "What is a Commit?",
    explanation:
      "A saved snapshot of your code changes, labeled with a short message describing what you updated.",
  },
  diff: {
    title: "What is a Diff?",
    explanation:
      "A line-by-line comparison showing what was added (+ in green) or removed (- in red).",
  },
  ci: {
    title: "What is CI (Continuous Integration)?",
    explanation:
      "Automated tests and checks run on GitHub servers to ensure new contributions don't break existing features.",
  },
  confidence: {
    title: "What is the Confidence Score?",
    explanation:
      "A 0–100 score calculated by RepoPilot checking whether touched files exist, test scripts run, and CONTRIBUTING rules are satisfied.",
  },
};

export function JargonTooltip({ term, children }: JargonTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info = JARGON_DEFINITIONS[term] || { title: "Term Info", explanation: "" };
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <span className="relative inline-flex items-center gap-0.5" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-0.5 text-zinc-700 dark:text-zinc-300 font-medium underline decoration-dotted decoration-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-help"
        aria-label={`Definition for ${info.title}`}
      >
        <span>{children || info.title}</span>
        <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-emerald-500 shrink-0 inline" />
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 p-3 rounded-lg bg-zinc-900 text-zinc-100 text-xs shadow-xl border border-zinc-800 pointer-events-none animate-in fade-in zoom-in-95 duration-150 leading-relaxed text-left font-normal"
        >
          <strong className="font-semibold block text-emerald-400 text-[11px] uppercase tracking-wider mb-1">
            {info.title}
          </strong>
          <span className="text-zinc-300 block">{info.explanation}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900" />
        </span>
      )}
    </span>
  );
}
