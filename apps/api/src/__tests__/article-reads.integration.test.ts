import { vi } from "vitest";

vi.mock("../middleware/auth", async () => {
  const { testAuthMiddleware, testRequireSession } = await import(
    "./helpers/auth-mock"
  );
  return {
    authMiddleware: testAuthMiddleware,
    requireSession: testRequireSession,
  };
});

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { app } from "../app";
import { ensureMigrations, integrationDbAvailable, truncateAll } from "./helpers/test-db";
import { createUser } from "./helpers/fixtures";
import { TEST_USER_HEADER } from "./helpers/auth-mock";

function req(userId: string, method = "GET", body?: unknown) {
  return app.request("/api/article-reads", {
    method,
    headers: { "Content-Type": "application/json", [TEST_USER_HEADER]: userId },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe.skipIf(!integrationDbAvailable)("article reads", () => {
  beforeAll(async () => {
    await ensureMigrations();
  });

  afterEach(async () => {
    await truncateAll();
  });

  it("starts empty and returns the account creation date", async () => {
    const u = await createUser();
    const res = await req(u.id);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reads).toEqual([]);
    expect(typeof body.accountCreatedAt).toBe("string");
  });

  it("marks an article as read once, and refreshes the date on a new reading", async () => {
    const u = await createUser();
    const first = await (await req(u.id, "POST", { slug: "alimentation-tdah-enfant" })).json();
    const second = await (await req(u.id, "POST", { slug: "alimentation-tdah-enfant" })).json();
    expect(second.readAt >= first.readAt).toBe(true);

    const body = await (await req(u.id)).json();
    expect(body.reads).toHaveLength(1);
    expect(body.reads[0]).toEqual({ slug: "alimentation-tdah-enfant", readAt: second.readAt });
  });

  it("keeps readings per user", async () => {
    const a = await createUser();
    const b = await createUser();
    await req(a.id, "POST", { slug: "alimentation-tdah-enfant" });
    const body = await (await req(b.id)).json();
    expect(body.reads).toEqual([]);
  });

  it("returns 422 for an invalid slug", async () => {
    const u = await createUser();
    const res = await req(u.id, "POST", { slug: "../Admin" });
    expect(res.status).toBe(422);
  });
});
