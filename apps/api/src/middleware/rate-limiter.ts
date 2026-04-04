import type { MiddlewareHandler } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 5 * 60 * 1000).unref();

export function rateLimiter(opts: {
  windowMs: number;
  limit: number;
}): MiddlewareHandler {
  return async (c, next) => {
    const forwarded = c.req.header("x-forwarded-for");
    const key = forwarded ? forwarded.split(",")[0]!.trim() : c.req.header("x-real-ip") || "unknown";
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }

    entry.count++;

    c.header("X-RateLimit-Limit", String(opts.limit));
    c.header(
      "X-RateLimit-Remaining",
      String(Math.max(0, opts.limit - entry.count))
    );
    c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > opts.limit) {
      return c.json({ error: "Too many requests" }, 429);
    }

    await next();
  };
}
