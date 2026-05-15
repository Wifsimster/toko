import { describe, it, expect } from "vitest";
import { app } from "../app";

// Smoke tests on the admin auth gate. We don't fabricate a session here
// (Better Auth integration is covered by other suites); the goal is to
// prove that an anonymous caller cannot reach the user-management routes.

describe("admin users routes", () => {
  it("GET /api/admin/users returns 401 without a session", async () => {
    const res = await app.request("/api/admin/users");
    expect(res.status).toBe(401);
  });

  it("PATCH /api/admin/users/:id/role returns 401 without a session", async () => {
    const res = await app.request("/api/admin/users/some-id/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: true }),
    });
    expect(res.status).toBe(401);
  });

  it("PATCH /api/admin/users/:id/premium returns 401 without a session", async () => {
    const res = await app.request("/api/admin/users/some-id/premium", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ premiumGranted: true }),
    });
    expect(res.status).toBe(401);
  });
});
