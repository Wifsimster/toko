import { describe, expect, it } from "vitest";
import { app } from "../app";
import { isAgentReadAllowed } from "../lib/agent-access";

describe("/api/article-reads", () => {
  it("requires a session", async () => {
    const res = await app.request("/api/article-reads");
    expect(res.status).toBe(401);
  });

  it("stays out of reach of agent keys", () => {
    expect(isAgentReadAllowed("GET", "/api/article-reads")).toBe(false);
  });
});
