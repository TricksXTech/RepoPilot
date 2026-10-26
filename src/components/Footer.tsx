import Link from "next/link";
import { Compass, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-base text-slate-900 dark:text-white">RepoPilot</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Autonomous developer workflow agent for Hackathon Track PS04. Helping engineers make confident, high-quality first contributions to any public GitHub repository through empirical evidence, automated verification, and prompt-injection-safe AI synthesis.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero-clone • Read-only GitHub REST API • Privacy by Design</span>
            </div>
          </div>

          {/* Col 2: Navigation & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Legal & Compliance
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/TricksXTech/repopilot/blob/main/SECURITY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Security Policy (SECURITY.md)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Tech & Track */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Hackathon Track
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Track PS04:</strong> Open-Source Contribution and Developer Workflow Agent. Built with Next.js App Router, Tailwind CSS, Google Gemini Flash, and Vitest.
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Licensed under MIT • Not affiliated with GitHub or Google
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} RepoPilot. Open source community contribution.</p>
          <p className="inline-flex items-center gap-1">
            Built with security, verification, and precision for open-source contributors
          </p>
        </div>
      </div>
    </footer>
  );
}
