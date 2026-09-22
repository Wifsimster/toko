import { describe, it, expect, vi, beforeEach } from "vitest";

const updates: unknown[] = [];
vi.mock("@focusflow/db", () => ({
  userPreferences: { userId: "user_id" },
  db: {
    update: () => ({
      set: (values: unknown) => ({
        where: async () => {
          updates.push(values);
        },
      }),
    }),
  },
}));

import { Hono } from "hono";
import { unsubscribeRoutes } from "../routes/unsubscribe";
import { makeUnsubscribeToken } from "../lib/unsubscribe";

const app = new Hono().route("/api/unsubscribe", unsubscribeRoutes);

describe("unsubscribe routes", () => {
  beforeEach(() => {
    updates.length = 0;
  });

  it("GET only shows a confirmation form — link scanners can't unsubscribe", async () => {
    const token = makeUnsubscribeToken("user_1", "weekly");
    const res = await app.request(`/api/unsubscribe?token=${token}`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('method="post"');
    expect(html).toContain("Me désinscrire");
    expect(updates).toHaveLength(0);
  });

  it("GET with an invalid token shows an error page", async () => {
    const res = await app.request("/api/unsubscribe?token=bad");
    expect(res.status).toBe(400);
    expect(updates).toHaveLength(0);
  });

  it("POST from the confirmation page unsubscribes and answers with HTML", async () => {
    const token = makeUnsubscribeToken("user_1", "weekly");
    const res = await app.request(`/api/unsubscribe?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "from=page",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(await res.text()).toContain("Désinscription confirmée");
    expect(updates).toHaveLength(1);
  });

  it("RFC 8058 one-click POST still unsubscribes with a JSON answer", async () => {
    const token = makeUnsubscribeToken("user_1", "daily");
    const res = await app.request(`/api/unsubscribe?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "List-Unsubscribe=One-Click",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ unsubscribed: true });
    expect(updates).toHaveLength(1);
  });
});
