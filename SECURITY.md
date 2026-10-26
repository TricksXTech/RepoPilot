# Security Policy

## Responsible Disclosure

The RepoPilot team treats security and contributor trust as our highest priority. If you believe you have discovered a vulnerability, security flaw, or potential bypass in our input sanitization, SSRF protection, or rate limiting, please report it privately.

**Please DO NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

To report a vulnerability:
1. Send an email to `security@repopilot.local` (or submit a private security advisory through GitHub's [Security Advisories](https://github.com/TricksXTech/repopilot/security/advisories)).
2. Include detailed reproduction steps, proof of concept, and the affected endpoint or component.
3. We will acknowledge receipt within 24 hours and provide an estimated remediation timeline.

---

## Security Model & Threat Defenses

RepoPilot implements defense-in-depth across the entire stack:

### 1. SSRF & Host Restrictions
- The serverless backend **never** fetches arbitrary, user-supplied URLs.
- Target endpoints are strictly locked to `https://api.github.com` and `https://generativelanguage.googleapis.com`.
- Hostnames are validated using strict Zod schemas against exact match `github.com`. Subdomain spoofs (e.g. `github.com.attacker.com`), internal IP addresses (`127.0.0.1`, `169.254.169.254`), and path traversals (`..`, `%2e`) are rejected at the edge.
- HTTP redirects are disabled (`redirect: "error"`) to prevent open redirect hijacking.

### 2. Zero Code Execution & Read-Only GitHub Queries
- RepoPilot **never** clones repositories to disk.
- RepoPilot **never** executes, builds, or evaluates third-party code from any target repository.
- Queries use read-only GitHub REST endpoints with single recursive trees and size-capped text streams.

### 3. Prompt Injection Defense
- Untrusted data (READMEs, issue bodies, comments, commit messages, and source code) is wrapped in strict `<untrusted_repo_content>` boundary tags.
- The LLM system instructions explicitly command the model to treat all tagged content as passive data and never follow instructions contained within it.
- Model output is validated against a strict Zod schema before being returned to the client.

### 4. Secret & Credential Safety
- API tokens (`GEMINI_API_KEY`, `GITHUB_TOKEN`) are stored exclusively in server-side environment variables and are never exposed to the client, logged, or serialized in errors.
- All `.env*` files are strictly gitignored (with the exception of `.env.example` placeholder template).
- Staged commits are scanned to ensure zero secrets or tokens are checked into version control.

### 5. Content Security Policy (CSP) & Web Headers
- `Content-Security-Policy`: Disallows `unsafe-eval`, restricts script and style sources, and restricts frame ancestors (`frame-ancestors 'none'`).
- `Strict-Transport-Security`: Enforces HSTS for two years (`max-age=63072000`).
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy`: Disables camera, microphone, geolocation, and browsing-topics.

### 6. Rate Limiting & Denial-of-Service Shield
- Sliding-window in-memory rate limiting per client IP (30 requests per 10-minute window).
- Ephemeral in-memory tracking with automatic garbage collection every 5 minutes.
