/**
 * Very small in-memory rate limiter to stop one visitor from using up your AI credits.
 *
 * Limitation (trade-off): memory is per server instance, so on serverless hosting
 * (e.g. Vercel) each instance counts separately and counts reset on restart.
 * That is fine for an MVP. For stronger protection later, use a shared store
 * such as Upstash Redis.
 *
 * Configure with RATE_LIMIT_PER_HOUR (default 30 generations per visitor per hour).
 */
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string): { ok: boolean; retryAfterSec: number } {
  const limit = Number(process.env.RATE_LIMIT_PER_HOUR) || 30;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) {
    const retryAfterSec = Math.ceil((recent[0] + WINDOW_MS - now) / 1000);
    hits.set(key, recent);
    return { ok: false, retryAfterSec };
  }
  recent.push(now);
  hits.set(key, recent);
  // Prevent the map from growing forever.
  if (hits.size > 10_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return { ok: true, retryAfterSec: 0 };
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}
