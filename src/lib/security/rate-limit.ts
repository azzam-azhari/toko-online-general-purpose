type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_TRACKED_KEYS = 10_000;

function pruneExpired(now: number) {
  if (rateLimitStore.size < MAX_TRACKED_KEYS) return;

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) rateLimitStore.delete(key);
  }
}

export function takeRateLimit({ key, limit, windowMs, now = Date.now() }: RateLimitOptions): RateLimitResult {
  pruneExpired(now);
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
    };
  }

  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), retryAfterSeconds: 0 };
}

export function getRequestIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || headers.get("x-real-ip")?.trim() || "unknown";
  return /^[0-9a-f:.]{2,45}$/i.test(candidate) ? candidate : "unknown";
}

export function resetRateLimitsForTests() {
  rateLimitStore.clear();
}
