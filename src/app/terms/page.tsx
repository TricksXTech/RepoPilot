import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Use | RepoPilot",
  description: "RepoPilot Terms of Service and Open-Source Contribution Disclaimers",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to RepoPilot
        </Link>

        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 space-y-2">
          <div className="flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight">Terms of Use</h1>
          </div>
          <p className="text-xs text-zinc-500">Last updated: October 2026 • Please review carefully</p>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <strong>Template Document Notice:</strong> This is an open-source template document prepared for the RepoPilot project. Please review and tailor it to your jurisdiction.
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              1. Acceptance of Terms &amp; &quot;As-Is&quot; Service
            </h2>
            <p>
              By accessing or using RepoPilot, you agree to be bound by these Terms of Use. The service is provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, whether express, statutory, or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              2. AI-Generated Output &amp; Mandatory Human Review
            </h2>
            <p>
              RepoPilot synthesizes contribution plans, code diffs, pull request drafts, and commit messages using artificial intelligence (Google Gemini Flash) and heuristic verification.
            </p>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-l-2 border-emerald-600 rounded-r text-xs text-emerald-900 dark:text-emerald-200">
              <strong>Mandatory Contributor Review:</strong> AI output can be incomplete or imperfect. All code diffs, command recommendations, and pull request drafts are <em>suggested templates</em>. You are solely responsible for testing and reviewing all generated code before executing commands or submitting pull requests.
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              3. Repository Licensing &amp; Community Guidelines
            </h2>
            <p>
              When contributing to any open-source project, you are personally responsible for respecting that repository&apos;s license, Code of Conduct, CLA (Contributor License Agreement), and CONTRIBUTING guidelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              4. Prohibited Uses
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Automated scraping or attempts to circumvent rate limits.</li>
              <li>Targeting non-public or unauthorized repositories.</li>
              <li>Spamming open-source repositories with unvetted automated pull requests.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              5. Non-Affiliation
            </h2>
            <p>
              RepoPilot is an independent community open-source project. It is <strong>not affiliated with, endorsed by, or sponsored by GitHub, Inc., Microsoft Corp., or Google LLC</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              6. Open-Source Licensing (MIT)
            </h2>
            <p>
              RepoPilot is licensed under the permissive <strong>MIT License</strong>. You are welcome to inspect, audit, fork, and self-host the source code.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              7. Limitation of Liability
            </h2>
            <p>
              In no event shall the authors or contributors of RepoPilot be liable for any direct, indirect, incidental, special, or consequential damages arising from the use of this service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
