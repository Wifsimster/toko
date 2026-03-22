import { describe, it, expect } from "vitest";
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
