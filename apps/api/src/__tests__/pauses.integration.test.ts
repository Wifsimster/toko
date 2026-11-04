import { vi } from "vitest";

vi.mock("../middleware/auth", async () => {
  const { testAuthMiddleware, testRequireSession } = await import("./helpers/auth-mock");
  return {
    authMiddleware: testAuthMiddleware,
    requireSession: testRequireSession,
  };
});

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { app } from "../app";
import { ensureMigrations, truncateAll, integrationDbAvailable } from "./helpers/test-db";
import { createUser } from "./helpers/fixtures";
import { TEST_USER_HEADER } from "./helpers/auth-mock";
import { gardenWeekDates } from "../lib/garden-week";
import { toLocalISODate, DEFAULT_TIMEZONE } from "../lib/local-date";

const skip = !integrationDbAvailable;

function req(userId: string, path: string, method = "GET", body?: unknown) {
  return app.request(path, {
    method,
    headers: { "Content-Type": "application/json", [TEST_USER_HEADER]: userId },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe.skipIf(skip)("pauses — DB integration", () => {
  beforeAll(async () => {
    await ensureMigrations();
  });

  afterEach(async () => {
    await truncateAll();
  });

  it("starts with an empty garden for the current week", async () => {
    const u = await createUser();
    const res = await req(u.id, "/api/pauses/garden");
    expect(res.status).toBe(200);
    const garden = await res.json();
    const today = toLocalISODate(DEFAULT_TIMEZONE);
    expect(garden.leaves).toBe(0);
    expect(garden.today).toBe(today);
    expect(garden.week.map((d: { date: string }) => d.date)).toEqual(gardenWeekDates(today));
    expect(garden.week.every((d: { leaf: boolean }) => !d.leaf)).toBe(true);
  });

  it("adds one leaf per pause and marks the day once", async () => {
    const u = await createUser();
    const today = toLocalISODate(DEFAULT_TIMEZONE);
    for (let i = 0; i < 2; i++) {
      const res = await req(u.id, "/api/pauses", "POST", { kind: "souffler", date: today, durationSeconds: 120 });
      expect(res.status).toBe(201);
    }
    const garden = await (await req(u.id, "/api/pauses/garden")).json();
    expect(garden.leaves).toBe(2);
    expect(garden.week.filter((d: { leaf: boolean }) => d.leaf)).toEqual([{ date: today, leaf: true }]);
  });

  it("keeps each parent's garden separate", async () => {
    const a = await createUser();
    const b = await createUser();
    const today = toLocalISODate(DEFAULT_TIMEZONE);
    await req(a.id, "/api/pauses", "POST", { kind: "souffler", date: today, durationSeconds: 60 });
    const garden = await (await req(b.id, "/api/pauses/garden")).json();
    expect(garden.leaves).toBe(0);
  });

  it("rejects an invalid pause with 422", async () => {
    const u = await createUser();
    const tooShort = await req(u.id, "/api/pauses", "POST", { kind: "souffler", date: "2026-11-04", durationSeconds: 5 });
    expect(tooShort.status).toBe(422);
    const badKind = await req(u.id, "/api/pauses", "POST", { kind: "dormir", date: "2026-11-04", durationSeconds: 60 });
    expect(badKind.status).toBe(422);
  });
});
