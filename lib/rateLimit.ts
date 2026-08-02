// A small in-memory sliding-window rate limiter.
//
// This is intentionally simple and process-local: fine for a single
// serverless-instance demo (matches the "in-memory demo storage" approach
// used for bookings elsewhere in this app), not a substitute for a shared
// store (e.g. Redis) in a real multi-instance deployment.

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the caller should wait before retrying, 0 if allowed. */
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (recent.length >= limit) {
    hits.set(key, recent);
    const retryAfterMs = recent[0] + windowMs - now;
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  recent.push(now);
  hits.set(key, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}
