/**
 * POST /api/analyze
 * Server-Sent Events (SSE) Streaming Route for RepoPilot Agent
 * Progressively streams:
 * 1. "validating"
 * 2. "evidence" (< 3s target)
 * 3. "generating" (AI synthesis)
 * 4. "verifying" (Deterministic rule engine)
 * 5. "complete"
 */
import { NextRequest, NextResponse } from "next/server";
import { parseAndValidateGitHubUrl, ValidationError, AnalysisRequestSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/ratelimit";
import { collectRepositoryEvidence, GitHubApiError } from "@/lib/github";
import { generateContributionArtifact } from "@/lib/gemini";
import { runVerificationEngine } from "@/lib/verification";
import { AnalysisPayload } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 45; // 45 seconds max timeout for Vercel Serverless

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting Guard
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: `Too many requests from your IP. Please try again in ${rateLimit.resetSeconds} seconds.`,
          resetSeconds: rateLimit.resetSeconds,
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimit.resetSeconds.toString(),
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // 2. Request Body Size & JSON Safety
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Malformed JSON request body." } },
      { status: 400 }
    );
  }

  // 3. Zod Input Validation
  const parseResult = AnalysisRequestSchema.safeParse(bodyJson);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues[0]?.message || "Invalid input parameters.";
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: errorMsg } },
      { status: 400 }
    );
  }

  const { url, issueNumber } = parseResult.data;

  // 4. Strict GitHub URL & SSRF parsing
  let repoIdentifier;
  try {
    repoIdentifier = parseAndValidateGitHubUrl(url, issueNumber);
  } catch (err: unknown) {
    const msg = err instanceof ValidationError ? err.message : "Invalid repository URL.";
    return NextResponse.json(
      { error: { code: "INVALID_URL", message: msg } },
      { status: 400 }
    );
  }

  const { owner, repo, issueNumber: targetIssue } = repoIdentifier;

  // 5. Initialize SSE Stream for progressive UI updates
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (payload: AnalysisPayload) => {
        const msg = `data: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(msg));
      };

      try {
        // Stage 1: Validating
        sendEvent({
          stage: "validating",
          progressPercent: 10,
          message: `Validating target repository ${owner}/${repo}...`,
        });

        // Stage 2: Fetch Repository Evidence (Parallel GitHub calls)
        sendEvent({
          stage: "validating",
          progressPercent: 25,
          message: `Collecting repository evidence via GitHub REST API (no clone, read-only)...`,
        });

        const { evidence, rawTreePaths } = await collectRepositoryEvidence(owner, repo, targetIssue);

        // Emit Evidence payload immediately (< 3 seconds)
        sendEvent({
          stage: "evidence",
          progressPercent: 50,
          message: `Evidence gathered: ${evidence.tree.totalFiles} files indexed, ${evidence.meta.stars} stars, ecosystem: ${evidence.ecosystem.ecosystem}.`,
          evidence,
        });

        // Stage 3: Synthesize Contribution Artifact (Only if an issue is selected)
        let artifact = null;
        let aiUnavailable = false;
        let aiUnavailableReason: string | undefined;

        if (evidence.issue) {
          sendEvent({
            stage: "generating",
            progressPercent: 70,
            message: `Synthesizing contribution plan for issue #${evidence.issue.number}...`,
            evidence,
          });

          const geminiKey = process.env.GEMINI_API_KEY?.trim();
          if (!geminiKey || geminiKey === "your_gemini_api_key_here") {
            // Server-side log without secrets (Requirement B8)
            console.log(
              `[RepoPilot Agent] Path: GEMINI_API_KEY not configured on server. Serving evidence only for ${owner}/${repo}#${evidence.issue.number}.`
            );
            aiUnavailable = true;
            aiUnavailableReason = "GEMINI_API_KEY is not configured on the server. Showing empirical evidence only.";
          } else {
            console.log(
              `[RepoPilot Agent] Path: Calling Gemini AI Provider (gemini-2.5-flash) for ${owner}/${repo}#${evidence.issue.number}.`
            );
            artifact = await generateContributionArtifact(evidence, rawTreePaths);
            if (!artifact) {
              console.log(
                `[RepoPilot Agent] Path: Gemini synthesis failed or timed out. Serving evidence only for ${owner}/${repo}#${evidence.issue.number}.`
              );
              aiUnavailable = true;
              aiUnavailableReason = "AI plan synthesis temporarily unavailable. Showing empirical evidence only.";
            }
          }
        } else {
          // No issue targeted (Requirement B7: do not generate a generic plan)
          console.log(
            `[RepoPilot Agent] Path: No target issue specified for ${owner}/${repo}. Skipping artifact generation; presenting top 5 suggested beginner issues.`
          );
        }

        // Stage 4: Deterministic Verification Engine
        sendEvent({
          stage: "verifying",
          progressPercent: 88,
          message: `Running deterministic verification checks...`,
          evidence,
          artifact,
          aiUnavailable,
          aiUnavailableReason,
        });

        const verification = runVerificationEngine(evidence, artifact, rawTreePaths);

        // Stage 5: Complete
        sendEvent({
          stage: "complete",
          progressPercent: 100,
          message: `Analysis complete`,
          evidence,
          artifact,
          verification,
          aiUnavailable,
          aiUnavailableReason,
        });

        controller.close();
      } catch (err: unknown) {
        console.error("[RepoPilot API Error]:", err instanceof Error ? err.message : err);

        let clientMsg = "An error occurred while analyzing the repository.";
        let errCode = "ANALYSIS_ERROR";
        let resetAt: string | undefined;

        if (err instanceof GitHubApiError) {
          clientMsg = err.message;
          errCode = err.isRateLimit ? "GITHUB_RATE_LIMITED" : "GITHUB_API_ERROR";
          resetAt = err.rateLimitReset;
        } else if (err instanceof ValidationError) {
          clientMsg = err.message;
          errCode = "VALIDATION_ERROR";
        } else if (err instanceof Error) {
          clientMsg = err.message;
        }

        sendEvent({
          stage: "error",
          progressPercent: 0,
          message: clientMsg,
          error: {
            code: errCode,
            message: clientMsg,
            resetAt,
          },
        });

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in reverse proxies
    },
  });
}

// Reject unexpected HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed. Use POST." }, { status: 405 });
}
