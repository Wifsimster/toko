import { describe, it, expect } from "vitest";
import { DISCORD_INVITE_URL } from "@focusflow/validators";
import { app } from "../app";

describe("Health endpoint", () => {
  it("GET /api/health returns status ok", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("toko-api");
    expect(body.timestamp).toBeDefined();
  });
});

describe("Unknown API routes", () => {
  it("returns a JSON 404 instead of falling through to the SPA", async () => {
    const res = await app.request("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(body).toEqual({ error: "Route introuvable", code: "NOT_FOUND" });
  });
});

describe("Discord redirect", () => {
  it("GET /discord redirects to the shared invite", async () => {
    const res = await app.request("/discord");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(DISCORD_INVITE_URL);
  });
});
