import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | RepoPilot",
  description: "RepoPilot Privacy Policy - Zero Data Retention & Privacy by Design",
};

export default function PrivacyPage() {
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
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-xs text-zinc-500">Last updated: October 2026 • Effective immediately</p>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <strong>Template Document Notice:</strong> This is an open-source template document prepared for the RepoPilot project. Please review and tailor it to your organization&apos;s specific compliance guidelines.
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              1. Privacy by Design: Zero Data Storage
            </h2>
            <p>
              RepoPilot was designed from the ground up with strict privacy principles. We operate <strong>without a database</strong>, <strong>without user accounts</strong>, <strong>without tracking cookies</strong>, and <strong>without analytics beacons</strong>. We do not store your repository queries, synthesized plans, diffs, or IP addresses on our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              2. What Data Is Processed
            </h2>
            <p>
              When you submit a repository URL (and optional issue reference), our serverless functions temporarily process:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Public GitHub Repository URL &amp; Issue ID:</strong> Parsed strictly to query public GitHub metadata.
              </li>
              <li>
                <strong>Publicly Available GitHub Metadata:</strong> README files, CONTRIBUTING guidelines, LICENSE, issue titles, commit messages, and repository tree structures fetched via the read-only GitHub REST API.
              </li>
              <li>
                <strong>Your IP Address (In-Memory Only):</strong> Used strictly for ephemeral rate limiting (to protect against denial-of-service abuse). IP records are stored in volatile server memory and discarded automatically every 10 minutes.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              3. Third-Party API Transmissions
            </h2>
            <p>
              To deliver the RepoPilot service, ephemeral requests are made to two trusted upstream providers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>GitHub REST API:</strong> To retrieve public repository governance files and issue information. We never ask for, require, or store your private GitHub credentials.
              </li>
              <li>
                <strong>Google Gemini API:</strong> Public repository snippets (e.g. issue descriptions and file paths) are transmitted over TLS to Google’s Gemini API solely to synthesize contribution artifacts. Per Google Cloud and Gemini terms, enterprise and API inputs are processed in accordance with strict confidentiality standards.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              4. Hosting &amp; Infrastructure Logs
            </h2>
            <p>
              RepoPilot is hosted on <strong>Vercel</strong>. Standard edge server logs (containing timestamp, requested URL, user-agent, and client IP) may be retained by Vercel for diagnostic and security compliance purposes in accordance with Vercel’s Privacy Policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              5. Local Browser Storage
            </h2>
            <p>
              The only data stored on your device is your local UI theme preference (Light or Dark mode), saved in standard browser <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs font-mono">localStorage</code>. This data never leaves your computer.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              6. Contact &amp; Open-Source Security Inquiries
            </h2>
            <p>
              For questions regarding this privacy policy or to report security vulnerabilities, please open an issue in the official GitHub repository or contact our team at:
            </p>
            <p className="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded border border-zinc-200 dark:border-zinc-800">
              security@repopilot.local (Placeholder - replace with maintainer contact)
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
