import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-950/40 py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">RepoPilot</span>
          <span>• Track PS04 Open-Source Contribution Agent</span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Terms
          </Link>
          <a
            href="https://github.com/TricksXTech/repopilot"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
