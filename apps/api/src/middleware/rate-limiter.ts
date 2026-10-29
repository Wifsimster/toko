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

setInterval(() => {
  const now = Date.now();
  for (const [namespace, store] of stores) {
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
    if (store.size === 0) stores.delete(namespace);
  }
}, 5 * 60 * 1000).unref();

function trustedProxyHops(): number {
  const n = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : 1;
}

function socketIp(c: Context): string | undefined {
  try {
    return getConnInfo(c).remote.address ?? undefined;
  } catch {
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
      if (parts.length >= hops) return parts[parts.length - hops]!;
    }
    const realIp = c.req.header("x-real-ip");
    if (realIp) return realIp.trim();
  }
  return socketIp(c) ?? "unknown";
}

export interface RateLimitOptions {
  windowMs: number;
  limit: number;
  namespace?: string;
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
