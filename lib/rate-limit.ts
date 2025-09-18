/**
 * Simple in-memory rate limiting helper.
 *
 * Designed for small-scale demo purposes where a distributed cache is not yet
 * required. Each key is tracked with a rolling window and request counter.
 */

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
};

export type RateLimitOptions = {
  key: string;
  windowMs?: number;
  limit?: number;
};

const store = new Map<string, { count: number; reset: number }>();
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 60;

/**
 * Apply a rate limit for a given identifier.
 */
export function applyRateLimit({
  key,
  windowMs = DEFAULT_WINDOW_MS,
  limit = DEFAULT_LIMIT,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.reset <= now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1, limit, reset: now + windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, limit, reset: existing.reset };
  }

  existing.count += 1;
  store.set(key, existing);

  return { success: true, remaining: Math.max(0, limit - existing.count), limit, reset: existing.reset };
}

/**
 * Extracts a best-effort identifier from a request for rate limiting.
 */
export function identifyRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}
