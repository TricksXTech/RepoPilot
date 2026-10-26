/**
 * In-memory sliding window rate limiter for Next.js API routes.
 * Protects against abuse while remaining serverless friendly.
 * Note: For production clusters, Vercel Firewall / Vercel KV rate limiting can also be enabled.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes window
const MAX_REQUESTS = 30; // 30 requests per window per IP

// Global map scoped to the node process
const ipCache = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipCache.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);
      if (record.timestamps.length === 0) {
        ipCache.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(clientIp: string): RateLimitResult {
  const now = Date.now();
  const safeIp = clientIp || "127.0.0.1";

  let record = ipCache.get(safeIp);
  if (!record) {
    record = { timestamps: [] };
    ipCache.set(safeIp, record);
  }

  // Filter timestamps outside window
  record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + WINDOW_MS - now) / 1000));
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = MAX_REQUESTS - record.timestamps.length;
  const resetSeconds = Math.ceil(WINDOW_MS / 1000);

  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining,
    resetSeconds,
  };
}
