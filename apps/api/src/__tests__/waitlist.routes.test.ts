import { describe, it, expect } from "vitest";
import { app } from "../app";

describe("POST /api/waitlist", () => {
  it("returns 422 for a missing email", async () => {
    const res = await app.request("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "android" }),
    });
    expect(res.status).toBe(422);
  });

  it("returns 422 for an invalid email", async () => {
    const res = await app.request("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nope" }),
    });
    expect(res.status).toBe(422);
  });

  it("returns 422 for an unknown source", async () => {
    const res = await app.request("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.fr", source: "ios" }),
    });
    expect(res.status).toBe(422);
  });
});
