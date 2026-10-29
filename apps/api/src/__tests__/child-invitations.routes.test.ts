import { describe, it, expect } from "vitest";
import { app } from "../app";

describe("GET /api/child-invitations/:token (public lookup)", () => {
  it("returns 404 for a token shorter than the 20-char entropy floor", async () => {
    const res = await app.request("/api/child-invitations/abc");
    expect(res.status).toBe(404);
  });

  it("returns 404 for an obviously-empty token (path traversal guard)", async () => {
    const res = await app.request("/api/child-invitations/");
    expect([401, 404]).toContain(res.status);
  });
});

describe("authentication gates on co-parent endpoints", () => {
  it("POST /api/child-invitations without a session returns 401", async () => {
    const res = await app.request("/api/child-invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId: "any",
        email: "co@famille.fr",
        parentalAuthorityAttestation: true,
      }),
    });
    expect(res.status).toBe(401);
  });

  it("GET /api/child-invitations (list pending) without a session returns 401", async () => {
    const res = await app.request("/api/child-invitations?childId=any");
    expect(res.status).toBe(401);
  });

  it("DELETE /api/child-invitations/:id without a session returns 401", async () => {
    const res = await app.request("/api/child-invitations/some-id", {
      method: "DELETE",
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/child-invitations/:token/accept without a session returns 401", async () => {
    const validShapeToken = "a".repeat(64);
    const res = await app.request(
      `/api/child-invitations/${validShapeToken}/accept`,
      { method: "POST" },
    );
    expect(res.status).toBe(401);
  });

  it("GET /api/child-access/child/:childId without a session returns 401", async () => {
    const res = await app.request("/api/child-access/child/some-id");
    expect(res.status).toBe(401);
  });

  it("DELETE /api/child-access/child/:childId/user/:userId without a session returns 401", async () => {
    const res = await app.request(
      "/api/child-access/child/some-child/user/some-user",
      { method: "DELETE" },
    );
    expect(res.status).toBe(401);
  });
});
