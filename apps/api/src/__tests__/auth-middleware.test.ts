import { describe, it, expect, vi, beforeEach } from "vitest";

const state = vi.hoisted(() => ({
  session: null as null | { user: { id: string }; session: { id: string } },
  row: undefined as undefined | { isBlocked: boolean },
}));

vi.mock("../lib/auth", () => ({
  auth: { api: { getSession: async () => state.session } },
}));
vi.mock("@focusflow/db", () => ({
  user: { id: "id", isBlocked: "is_blocked" },
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => (state.row ? [state.row] : []),
        }),
      }),
    }),
  },
}));

import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();
app.use("*", authMiddleware);
app.get("/", (c) => c.json({ ok: true }));

describe("authMiddleware", () => {
  beforeEach(() => {
    state.session = { user: { id: "u1" }, session: { id: "s1" } };
    state.row = { isBlocked: false };
  });

  it("lets an active user through", async () => {
    expect((await app.request("/")).status).toBe(200);
  });

  it("rejects a blocked user even with a still-valid cached session cookie", async () => {
    state.row = { isBlocked: true };
    const res = await app.request("/");
    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe("ACCOUNT_BLOCKED");
  });

  it("rejects a session whose user no longer exists", async () => {
    state.row = undefined;
    expect((await app.request("/")).status).toBe(401);
  });

  it("limits each signed-in parent separately, not per IP", async () => {
    delete process.env.RATE_LIMIT_BYPASS;
    // Same client IP for everyone, as behind one NAT.
    const sameIp = { headers: { "x-forwarded-for": "203.0.113.7" } };
    state.session = { user: { id: "limit-a" }, session: { id: "sa" } };
    for (let i = 0; i < 120; i++) expect((await app.request("/", sameIp)).status).toBe(200);
    const blocked = await app.request("/", sameIp);
    expect(blocked.status).toBe(429);
    expect((await blocked.json()).code).toBe("RATE_LIMITED");

    state.session = { user: { id: "limit-b" }, session: { id: "sb" } };
    expect((await app.request("/", sameIp)).status).toBe(200);
  });

  it("rejects requests without a session", async () => {
    state.session = null;
    expect((await app.request("/")).status).toBe(401);
  });
});
