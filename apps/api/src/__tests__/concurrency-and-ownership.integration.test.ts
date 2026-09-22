// Integration tests for race / ownership fixes (child limit, lock-pin prefs,
// roadmap votes, push endpoint ownership, calm-minutes plan gate).
// Skips unless INTEGRATION_DB=1 — see helpers/test-db.ts.
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
import { eq } from "drizzle-orm";
import {
  db,
  children,
  pushSubscriptions,
  roadmapItems,
} from "@focusflow/db";
import { app } from "../app";
import {
  ensureMigrations,
  truncateAll,
  integrationDbAvailable,
} from "./helpers/test-db";
import { createChild, createUser } from "./helpers/fixtures";
import { TEST_USER_HEADER } from "./helpers/auth-mock";

const skip = !integrationDbAvailable;

function req(userId: string, path: string, method = "GET", body?: unknown) {
  return app.request(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      [TEST_USER_HEADER]: userId,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe.skipIf(skip)("concurrency & ownership — DB integration", () => {
  beforeAll(async () => {
    await ensureMigrations();
  });

  afterEach(async () => {
    await db.delete(roadmapItems);
    await truncateAll();
  });

  it("parallel child creation cannot bypass the free-plan limit", async () => {
    const parent = await createUser();
    const body = { name: "Léa", ageRange: "6-8", healthDataConsent: true };

    const results = await Promise.all([
      req(parent.id, "/api/children", "POST", body),
      req(parent.id, "/api/children", "POST", body),
      req(parent.id, "/api/children", "POST", body),
    ]);

    const statuses = results.map((r) => r.status).sort();
    expect(statuses).toEqual([201, 403, 403]);
    const rows = await db
      .select({ id: children.id })
      .from(children)
      .where(eq(children.parentId, parent.id));
    expect(rows).toHaveLength(1);
  });

  it("concurrent first lock-pin GETs do not 500", async () => {
    const u = await createUser();
    const results = await Promise.all([
      req(u.id, "/api/account/lock-pin"),
      req(u.id, "/api/account/lock-pin"),
      req(u.id, "/api/account/lock-pin"),
    ]);
    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
  });

  it("voting on an unknown roadmap item answers 404", async () => {
    const u = await createUser();
    const res = await req(u.id, "/api/roadmap/does-not-exist/vote", "POST");
    expect(res.status).toBe(404);
  });

  it("voting twice on an existing item stays idempotent", async () => {
    const u = await createUser();
    const [item] = await db
      .insert(roadmapItems)
      .values({ title: "Idée" })
      .returning({ id: roadmapItems.id });
    const first = await req(u.id, `/api/roadmap/${item!.id}/vote`, "POST");
    const second = await req(u.id, `/api/roadmap/${item!.id}/vote`, "POST");
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it("subscribing a browser takes its endpoint over from the previous user", async () => {
    const a = await createUser();
    const b = await createUser();
    const sub = {
      endpoint: "https://push.example.test/abc",
      keys: { p256dh: "p", auth: "k" },
    };

    expect((await req(a.id, "/api/push/subscribe", "POST", sub)).status).toBe(200);
    expect((await req(b.id, "/api/push/subscribe", "POST", sub)).status).toBe(200);

    const rows = await db
      .select({ userId: pushSubscriptions.userId })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, sub.endpoint));
    expect(rows).toEqual([{ userId: b.id }]);

    const del = await req(b.id, "/api/push/subscribe", "DELETE", {
      endpoint: sub.endpoint,
    });
    expect(del.status).toBe(200);
    const after = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, sub.endpoint));
    expect(after).toHaveLength(0);
  });

  it("calm-minutes beyond a week requires the plan", async () => {
    const u = await createUser();
    const child = await createChild({ ownerId: u.id });

    const week = await req(u.id, `/api/stats/${child.id}/calm-minutes`);
    expect(week.status).toBe(200);
    expect(((await week.json()) as { periodDays: number }).periodDays).toBe(7);

    const quarter = await req(
      u.id,
      `/api/stats/${child.id}/calm-minutes?period=quarter`,
    );
    expect(quarter.status).toBe(403);
  });
});
