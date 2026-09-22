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

  it("rejects requests without a session", async () => {
    state.session = null;
    expect((await app.request("/")).status).toBe(401);
  });
});
