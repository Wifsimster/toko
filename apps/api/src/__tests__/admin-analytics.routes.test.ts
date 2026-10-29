import { describe, it, expect } from "vitest";
import { app } from "../app";

describe("GET /api/admin/analytics/events", () => {
  it("returns 401 without a session", async () => {
    const res = await app.request("/api/admin/analytics/events");
    expect(res.status).toBe(401);
  });

  it("returns 401 when querying with a days parameter without auth", async () => {
    const res = await app.request("/api/admin/analytics/events?days=7");
    expect(res.status).toBe(401);
  });
});
