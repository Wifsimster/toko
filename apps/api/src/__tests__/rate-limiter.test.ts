import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Hono } from "hono";
import { rateLimiter } from "../middleware/rate-limiter";

function makeApp(
  opts: Parameters<typeof rateLimiter>[0],
  {
    setUser,
  }: { setUser?: (c: { set: (k: string, v: unknown) => void }) => void } = {},
) {
  const app = new Hono();
  if (setUser) {
    app.use("*", async (c, next) => {
      setUser(c);
      await next();
    });
  }
  app.use("*", rateLimiter(opts));
  app.get("/", (c) => c.json({ ok: true }));
  return app;
}

function req(ip = "1.2.3.4") {
  return { headers: { "x-forwarded-for": ip } };
}

describe("rateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit and exposes X-RateLimit headers", async () => {
    const app = makeApp({ namespace: "t1", windowMs: 60_000, limit: 3 });

    for (let i = 1; i <= 3; i++) {
      const res = await app.request("/", req());
      expect(res.status).toBe(200);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("3");
      expect(res.headers.get("X-RateLimit-Remaining")).toBe(String(3 - i));
      expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
    }
  });

  it("returns 429 with Retry-After once the limit is exceeded", async () => {
    const app = makeApp({ namespace: "t2", windowMs: 60_000, limit: 2 });

    expect((await app.request("/", req())).status).toBe(200);
    expect((await app.request("/", req())).status).toBe(200);

    const blocked = await app.request("/", req());
    expect(blocked.status).toBe(429);
    const body = await blocked.json();
    expect(body.code).toBe("RATE_LIMITED");
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("resets counters after the window elapses", async () => {
    const app = makeApp({ namespace: "t3", windowMs: 1_000, limit: 1 });

    expect((await app.request("/", req())).status).toBe(200);
    expect((await app.request("/", req())).status).toBe(429);

    vi.advanceTimersByTime(1_100);

    expect((await app.request("/", req())).status).toBe(200);
  });

  it("isolates counters across namespaces", async () => {
    const appA = makeApp({ namespace: "ns-a", windowMs: 60_000, limit: 1 });
    const appB = makeApp({ namespace: "ns-b", windowMs: 60_000, limit: 1 });

    expect((await appA.request("/", req())).status).toBe(200);
    expect((await appA.request("/", req())).status).toBe(429);
    // Same IP, different namespace — should get its own fresh bucket
    expect((await appB.request("/", req())).status).toBe(200);
  });

  it("keys by IP by default — different IPs have separate buckets", async () => {
    const app = makeApp({ namespace: "t4", windowMs: 60_000, limit: 1 });

    expect((await app.request("/", req("10.0.0.1"))).status).toBe(200);
    expect((await app.request("/", req("10.0.0.1"))).status).toBe(429);
    expect((await app.request("/", req("10.0.0.2"))).status).toBe(200);
  });

  it("keyBy: 'user' isolates per user id", async () => {
    let userId = "alice";
    const app = makeApp(
      { namespace: "t5", windowMs: 60_000, limit: 1, keyBy: "user" },
      { setUser: (c) => c.set("user", { id: userId }) },
    );

    expect((await app.request("/", req())).status).toBe(200);
    expect((await app.request("/", req())).status).toBe(429);

    userId = "bob";
    expect((await app.request("/", req())).status).toBe(200);
  });

  it("keyBy: 'user' falls back to IP when no user is set", async () => {
    const app = makeApp({
      namespace: "t6",
      windowMs: 60_000,
      limit: 1,
      keyBy: "user",
    });

    expect((await app.request("/", req("10.0.0.5"))).status).toBe(200);
    expect((await app.request("/", req("10.0.0.5"))).status).toBe(429);
    expect((await app.request("/", req("10.0.0.6"))).status).toBe(200);
  });

  it("honors x-real-ip when x-forwarded-for is absent", async () => {
    const app = makeApp({ namespace: "t7", windowMs: 60_000, limit: 1 });

    const r1 = await app.request("/", { headers: { "x-real-ip": "9.9.9.9" } });
    const r2 = await app.request("/", { headers: { "x-real-ip": "9.9.9.9" } });
    const r3 = await app.request("/", { headers: { "x-real-ip": "8.8.8.8" } });
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(429);
    expect(r3.status).toBe(200);
  });

  it("takes only the first hop of a comma-separated X-Forwarded-For", async () => {
    const app = makeApp({ namespace: "t8", windowMs: 60_000, limit: 1 });

    const r1 = await app.request("/", {
      headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" },
    });
    const r2 = await app.request("/", {
      headers: { "x-forwarded-for": "1.1.1.1, 3.3.3.3" },
    });
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(429); // still 1.1.1.1
  });

  it("accepts a custom key function", async () => {
    const app = makeApp({
      namespace: "t9",
      windowMs: 60_000,
      limit: 1,
      keyBy: (c) => c.req.header("x-tenant") ?? "anon",
    });

    const r1 = await app.request("/", { headers: { "x-tenant": "acme" } });
    const r2 = await app.request("/", { headers: { "x-tenant": "acme" } });
    const r3 = await app.request("/", { headers: { "x-tenant": "globex" } });
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(429);
    expect(r3.status).toBe(200);
  });
});
