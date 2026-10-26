"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is RepoPilot?",
    answer:
      "RepoPilot is an open-source AI agent designed for Hackathon Track PS04. It helps developers make their first contribution to any public GitHub repository by inspecting real files and generating a verified, step-by-step contribution plan.",
  },
  {
    question: "Is it safe to use?",
    answer:
      "Yes. RepoPilot uses GitHub's read-only REST API. It never clones repositories to our servers, never executes third-party code, and enforces strict SSRF and prompt-injection defenses.",
  },
  {
    question: "Does it change my repo or write to GitHub?",
    answer:
      "Never. RepoPilot is 100% read-only. It has no write permissions on GitHub and cannot create commits, branches, or pull requests on your behalf without your explicit local action.",
  },
  {
    question: "Do I need a GitHub account or sign-up?",
    answer:
      "No account or sign-up is required. You can paste any public GitHub repository URL and receive an instant contribution plan immediately.",
  },
  {
    question: "Is the AI always right?",
    answer:
      "No AI is infallible. That is why RepoPilot includes an automated verification engine that checks every touched file against the git tree, validates test commands, and displays a prominent 'suggested, review before use' disclaimer.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-8 space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Everything complete beginners need to know
        </h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors min-h-[44px]"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-850 pt-3 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
