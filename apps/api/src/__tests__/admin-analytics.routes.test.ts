import { describe, it, expect } from "vitest";
import { app } from "../app";

// Smoke tests on the admin auth gate. We don't fabricate a session here
// (Better Auth integration is covered by other suites); the goal is to
// prove that an anonymous caller cannot reach the aggregation queries.

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
