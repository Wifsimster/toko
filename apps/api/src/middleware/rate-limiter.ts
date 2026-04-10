import type { Context, MiddlewareHandler } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(namespace: string): Map<string, RateLimitEntry> {
  let s = stores.get(namespace);
  if (!s) {
    s = new Map();
    stores.set(namespace, s);
  }
  return s;
}

// Cleanup expired entries across all namespaces every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

function clientIp(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return c.req.header("x-real-ip") ?? "unknown";
}

export interface RateLimitOptions {
  windowMs: number;
  limit: number;
  /**
   * Namespace isolates counters between different limiters — otherwise a
   * global limiter and a strict per-route limiter would share the same bucket.
   */
  namespace?: string;
  /**
   * Key derivation. Defaults to client IP. Use `"user"` to key on the
   * authenticated user id (falls back to IP for anonymous requests).
   */
  keyBy?: "ip" | "user" | ((c: Context) => string);
}

export function rateLimiter(opts: RateLimitOptions): MiddlewareHandler {
  const namespace = opts.namespace ?? "global";
  const keyFn =
    typeof opts.keyBy === "function"
      ? opts.keyBy
      : opts.keyBy === "user"
        ? (c: Context) => {
            const user = c.get("user") as { id?: string } | undefined;
            return user?.id ? `u:${user.id}` : `ip:${clientIp(c)}`;
          }
        : (c: Context) => `ip:${clientIp(c)}`;

  return async (c, next) => {
    const store = getStore(namespace);
    const key = keyFn(c);
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
      const retryAfter = Math.max(
        1,
        Math.ceil((entry.resetAt - now) / 1000)
      );
      c.header("Retry-After", String(retryAfter));
      return c.json({ error: "Too many requests", code: "RATE_LIMITED" }, 429);
    }

    await next();
  };
}
