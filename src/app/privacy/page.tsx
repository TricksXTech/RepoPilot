import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | RepoPilot",
  description: "RepoPilot Privacy Policy - Zero Data Retention & Privacy by Design",
};

export default function PrivacyPage() {
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
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: October 2026 • Effective immediately
          </p>
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
            <strong>Notice:</strong> This is an open-source template document prepared for the RepoPilot project. Please review and tailor it to your organization’s specific compliance guidelines.
          </div>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              1. Privacy by Design: Zero Data Storage
            </h2>
            <p>
              RepoPilot was designed from the ground up with strict privacy principles. We operate <strong>without a database</strong>, <strong>without user accounts</strong>, <strong>without tracking cookies</strong>, and <strong>without analytics beacons</strong>. We do not store your repository queries, synthesized plans, diffs, or IP addresses on our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              2. What Data Is Processed
            </h2>
            <p>
              When you submit a repository URL (and optional issue reference), our serverless functions temporarily process:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>The Public GitHub Repository URL & Issue ID:</strong> Parsed strictly to query public GitHub metadata.
              </li>
              <li>
                <strong>Publicly Available GitHub Metadata:</strong> README files, CONTRIBUTING guidelines, LICENSE, issue titles, commit messages, and repository tree structures fetched via the read-only GitHub REST API.
              </li>
              <li>
                <strong>Your IP Address (In-Memory Only):</strong> Used strictly for ephemeral rate limiting (to protect against denial-of-service abuse). IP records are stored in volatile server memory and discarded automatically every 10 minutes.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              3. Third-Party API Transmissions
            </h2>
            <p>
              To deliver the RepoPilot service, ephemeral requests are made to two trusted upstream providers:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>GitHub REST API:</strong> To retrieve public repository governance files and issue information. We never ask for, require, or store your private GitHub credentials.
              </li>
              <li>
                <strong>Google Gemini API:</strong> Public repository snippets (e.g. issue descriptions and file paths) are transmitted over TLS to Google’s Gemini API solely to synthesize contribution artifacts. Per Google Cloud and Gemini terms, enterprise and API inputs are processed in accordance with strict confidentiality standards.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              4. Hosting & Infrastructure Logs
            </h2>
            <p>
              RepoPilot is hosted on <strong>Vercel</strong>. Like all web platforms, standard ephemeral edge server logs (containing timestamp, requested URL, user-agent, and client IP) may be retained by Vercel for diagnostic and security compliance purposes in accordance with Vercel’s Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              5. Local Browser Storage
            </h2>
            <p>
              The only data stored on your device is your local UI theme preference (Light or Dark mode), saved in standard browser <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono">localStorage</code>. This data never leaves your computer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              6. Contact & Open-Source Security Inquiries
            </h2>
            <p>
              For questions regarding this privacy policy or to report security vulnerabilities, please open an issue in the official GitHub repository or contact our team at:
            </p>
            <p className="font-mono text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800">
              security@repopilot.local (Placeholder - replace with maintainer contact)
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
