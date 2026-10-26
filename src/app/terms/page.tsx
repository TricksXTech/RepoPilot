import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Use | RepoPilot",
  description: "RepoPilot Terms of Service and Open-Source Contribution Disclaimers",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to RepoPilot
        </Link>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: October 2026 • Please read carefully before using the service
          </p>
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
            <strong>Notice:</strong> This is an open-source template document prepared for the RepoPilot project. Please review and tailor it to your project’s legal jurisdiction.
          </div>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              1. Acceptance of Terms &amp; &quot;As-Is&quot; Service
            </h2>
            <p>
              By accessing or using RepoPilot, you agree to be bound by these Terms of Use. The service is provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, whether express, statutory, or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              2. AI-Generated Output & Mandatory Human Review
            </h2>
            <p>
              RepoPilot synthesizes contribution plans, code diffs, pull request drafts, and commit messages using artificial intelligence (Google Gemini Flash) and heuristic verification.
            </p>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 rounded-r-lg text-sm text-emerald-900 dark:text-emerald-200">
              <strong>Mandatory Contributor Review:</strong> AI output can be incomplete, imperfect, or out-of-date. All code diffs, command recommendations, and pull request drafts are <em>suggested templates</em>. You, as the developer, are solely responsible for testing, verifying, and reviewing all generated code before executing commands or submitting pull requests to any repository.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              3. Repository Licensing & Community Guidelines
            </h2>
            <p>
              When contributing to any open-source project, you are personally responsible for respecting that repository’s license, Code of Conduct, CLA (Contributor License Agreement), and CONTRIBUTING guidelines. RepoPilot does not grant you rights to third-party repositories.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              4. Prohibited Uses
            </h2>
            <p>You agree not to use RepoPilot for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Automated scraping, denial-of-service attacks, or attempts to circumvent rate limits.</li>
              <li>Targeting non-public or unauthorized repositories.</li>
              <li>Spamming open-source repositories with unvetted or low-quality automated pull requests.</li>
              <li>Injecting malicious code, exploits, or toxic content into open-source projects.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              5. Non-Affiliation
            </h2>
            <p>
              RepoPilot is an independent, community open-source project. It is <strong>not affiliated with, endorsed by, or sponsored by GitHub, Inc., Microsoft Corp., or Google LLC</strong>. All trademarks, service marks, and company names are the property of their respective owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              6. Open-Source Licensing (MIT)
            </h2>
            <p>
              RepoPilot itself is licensed under the permissive <strong>MIT License</strong>. You are welcome to inspect, audit, fork, and self-host the source code in accordance with the MIT license terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              7. Limitation of Liability
            </h2>
            <p>
              In no event shall the authors, maintainers, or contributors of RepoPilot be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from the use of, or inability to use, this application or any AI-generated contribution artifacts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              8. Modifications
            </h2>
            <p>
              We reserve the right to revise or update these Terms of Use at any time. Continued use of the service constitutes acceptance of any revised terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
