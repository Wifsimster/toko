import type { Context, MiddlewareHandler } from "hono";
import { getConnInfo } from "@hono/node-server/conninfo";

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
  for (const [namespace, store] of stores) {
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
    // Drop the namespace bucket once empty so dynamic namespaces don't grow
    // the top-level map unboundedly.
    if (store.size === 0) stores.delete(namespace);
  }
}, 5 * 60 * 1000).unref();

/**
 * Number of reverse proxies we trust in front of the API. Each one appends
 * the address it received the request from to X-Forwarded-For, so the real
 * client IP is the Nth entry from the right. Everything to the left of it is
 * client-controlled and must never be used as a rate-limit key (a client
 * could rotate a fake first entry to get a fresh bucket on every request).
 * Production runs behind a single Traefik → default 1. Set 0 when the API is
 * exposed directly (X-Forwarded-For is then ignored entirely).
 */
function trustedProxyHops(): number {
  const n = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : 1;
}

function socketIp(c: Context): string | undefined {
  try {
    return getConnInfo(c).remote.address ?? undefined;
  } catch {
    // No Node socket (e.g. `app.request()` in tests).
    return undefined;
  }
}

export function clientIp(c: Context): string {
  const hops = trustedProxyHops();
  if (hops > 0) {
    const forwarded = c.req.header("x-forwarded-for");
    if (forwarded) {
      const parts = forwarded
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      // Fewer entries than trusted hops: the chain is incomplete, so no
      // entry can be trusted — fall through to the other sources.
      if (parts.length >= hops) return parts[parts.length - hops]!;
    }
    // Set by the proxy itself (Traefik overwrites any client value).
    const realIp = c.req.header("x-real-ip");
    if (realIp) return realIp.trim();
  }
  return socketIp(c) ?? "unknown";
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
    // CI e2e shares a single client IP across the full suite, so the
    // 120 req/min global cap fires mid-run and tests see a redirect to
    // /login instead of the page under test. Opt-out is gated by an
    // explicit env var so dev + prod always keep the limiter active.
    if (process.env.RATE_LIMIT_BYPASS === "1") {
      await next();
      return;
    }

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
