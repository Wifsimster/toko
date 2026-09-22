// Barkley token-economy integration tests. Skips unless INTEGRATION_DB=1 —
// see helpers/test-db.ts and child-invitations.integration.test.ts for how
// to run against a local Postgres.
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
  barkleyBehaviors,
  barkleyBehaviorLogs,
  barkleyRewards,
  childAccess,
  user as userTable,
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
  return app.request(`/api/barkley${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      [TEST_USER_HEADER]: userId,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function stars(userId: string, childId: string) {
  const res = await req(userId, `/stars/${childId}`);
  expect(res.status).toBe(200);
  return (await res.json()) as {
    totalStars: number;
    spentStars: number;
    availableStars: number;
  };
}

async function seedBehaviorWithStars(childId: string, n: number) {
  const [behavior] = await db
    .insert(barkleyBehaviors)
    .values({ childId, name: "Ranger sa chambre" })
    .returning();
  await db.insert(barkleyBehaviorLogs).values(
    Array.from({ length: n }, (_, i) => ({
      behaviorId: behavior!.id,
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      completed: true,
    })),
  );
  return behavior!;
}

describe.skipIf(skip)("barkley — DB integration", () => {
  beforeAll(async () => {
    await ensureMigrations();
  });

  afterEach(async () => {
    await truncateAll();
  });

  it("keeps the balance stable when a claimed reward or a logged behavior is deleted", async () => {
    const owner = await createUser();
    const child = await createChild({ ownerId: owner.id });
    const behavior = await seedBehaviorWithStars(child.id, 10);
    const [reward] = await db
      .insert(barkleyRewards)
      .values({ childId: child.id, name: "Glace", starsRequired: 4 })
      .returning();

    expect((await req(owner.id, `/rewards/${reward!.id}/claim`, "POST", {})).status).toBe(200);
    expect(await stars(owner.id, child.id)).toMatchObject({
      totalStars: 10,
      spentStars: 4,
      availableStars: 6,
    });

    expect((await req(owner.id, `/rewards/${reward!.id}`, "DELETE")).status).toBe(200);
    expect((await req(owner.id, `/behaviors/${behavior.id}`, "DELETE")).status).toBe(200);

    expect(await stars(owner.id, child.id)).toMatchObject({
      totalStars: 10,
      spentStars: 4,
      availableStars: 6,
    });

    // Archived rows are hidden from lists.
    const rewards = (await (await req(owner.id, `/rewards/${child.id}`)).json()) as unknown[];
    const behaviors = (await (await req(owner.id, `/behaviors/${child.id}`)).json()) as unknown[];
    expect(rewards).toHaveLength(0);
    expect(behaviors).toHaveLength(0);
    // …and cannot be touched any more.
    expect((await req(owner.id, `/rewards/${reward!.id}/claim`, "POST", {})).status).toBe(404);
    expect((await req(owner.id, `/behaviors/${behavior.id}`, "PATCH", { name: "x" })).status).toBe(404);
  });

  it("hard-deletes a never-claimed reward", async () => {
    const owner = await createUser();
    const child = await createChild({ ownerId: owner.id });
    const [reward] = await db
      .insert(barkleyRewards)
      .values({ childId: child.id, name: "Glace", starsRequired: 4 })
      .returning();

    expect((await req(owner.id, `/rewards/${reward!.id}`, "DELETE")).status).toBe(200);
    const rows = await db.select().from(barkleyRewards).where(eq(barkleyRewards.id, reward!.id));
    expect(rows).toHaveLength(0);
  });

  it("lets a claimed reward be edited without changing past spending", async () => {
    const owner = await createUser();
    const child = await createChild({ ownerId: owner.id });
    await seedBehaviorWithStars(child.id, 10);
    const [reward] = await db
      .insert(barkleyRewards)
      .values({ childId: child.id, name: "Glace", starsRequired: 4 })
      .returning();

    await req(owner.id, `/rewards/${reward!.id}/claim`, "POST", {});
    const patch = await req(owner.id, `/rewards/${reward!.id}`, "PATCH", { starsRequired: 8 });
    expect(patch.status).toBe(200);
    expect(await patch.json()).toMatchObject({ starsRequired: 8, timesClaimed: 1, starsSpent: 4 });

    expect(await stars(owner.id, child.id)).toMatchObject({ spentStars: 4, availableStars: 6 });
  });

  it("rejects out-of-range starsRequired with 422 instead of overflowing", async () => {
    const owner = await createUser();
    const child = await createChild({ ownerId: owner.id });
    const res = await req(owner.id, "/rewards", "POST", {
      childId: child.id,
      name: "Trop cher",
      starsRequired: 3_000_000_000,
    });
    expect(res.status).toBe(422);
  });

  it("gates step progress on the child owner's Formation, not the co-parent's", async () => {
    const owner = await createUser();
    const coParent = await createUser();
    const child = await createChild({ ownerId: owner.id });
    await db.insert(childAccess).values({
      childId: child.id,
      userId: coParent.id,
      role: "co_parent",
    });
    await db
      .update(userTable)
      .set({ formationGrandfathered: false })
      .where(eq(userTable.id, coParent.id));
    await db
      .update(userTable)
      .set({ formationGrandfathered: true })
      .where(eq(userTable.id, owner.id));

    const res = await req(coParent.id, "/steps", "POST", {
      childId: child.id,
      stepNumber: 1,
    });
    expect(res.status).toBe(201);
  });
});
