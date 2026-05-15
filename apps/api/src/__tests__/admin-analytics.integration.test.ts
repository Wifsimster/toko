// Integration suite for the admin analytics dashboard endpoint. Skips
// unless INTEGRATION_DB=1 is set — see helpers/test-db.ts. Run locally:
//
//   docker compose -f compose.local.yml up -d postgres
//   DATABASE_URL=postgres://toko:toko_secret@localhost:5432/toko_test \
//     INTEGRATION_DB=1 \
//     DB_ENCRYPTION_KEY=$(openssl rand -hex 32) \
//     pnpm --filter @focusflow/api test
//
// The smoke suite (admin-analytics.routes.test.ts) only proves the auth
// gate returns 401. This suite executes every aggregate query against a
// real Postgres — the path that caught the Date-serialization and
// correlated-subquery bugs the query builder hid.
import { vi } from "vitest";

// Hoisted above imports so app.ts loads the route with the mocked gate.
vi.mock("../middleware/auth", async () => {
  const { testAuthMiddleware } = await import("./helpers/auth-mock");
  return { authMiddleware: testAuthMiddleware };
});

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { db, events } from "@focusflow/db";
import { app } from "../app";
import {
  ensureMigrations,
  truncateAll,
  integrationDbAvailable,
} from "./helpers/test-db";
import { createUser } from "./helpers/fixtures";
import { TEST_USER_HEADER } from "./helpers/auth-mock";

const skip = !integrationDbAvailable;

interface AnalyticsPayload {
  days: number;
  byDay: unknown[];
  totals7d: { eventName: string; count: number }[];
  totalsRange: { eventName: string; count: number }[];
  derived7d: Record<string, unknown>;
  timeToAha: Record<string, unknown>;
  churnSignals: Record<string, unknown>;
  paid30d: Record<string, unknown>;
  alerts: unknown[];
}

describe.skipIf(skip)("GET /api/admin/analytics/events — DB integration", () => {
  beforeAll(async () => {
    await ensureMigrations();
  });

  afterEach(async () => {
    await truncateAll();
  });

  it("returns 403 for an authenticated non-admin user", async () => {
    const parent = await createUser();

    const res = await app.request("/api/admin/analytics/events", {
      headers: { [TEST_USER_HEADER]: parent.id },
    });

    expect(res.status).toBe(403);
  });

  it("returns 200 with the full aggregate payload for an admin (no events)", async () => {
    const admin = await createUser({ name: "Admin", isAdmin: true });

    const res = await app.request("/api/admin/analytics/events?days=30", {
      headers: { [TEST_USER_HEADER]: admin.id },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as AnalyticsPayload;
    expect(body.days).toBe(30);
    expect(Array.isArray(body.byDay)).toBe(true);
    expect(Array.isArray(body.totalsRange)).toBe(true);
    expect(Array.isArray(body.alerts)).toBe(true);
    // Every derived block must be present — proves each aggregate query
    // (including the raw cohort/aha/churn SQL) ran without throwing.
    expect(body.derived7d).toBeDefined();
    expect(body.timeToAha).toBeDefined();
    expect(body.churnSignals).toBeDefined();
    expect(body.paid30d).toBeDefined();
  });

  it("aggregates real event rows for an admin", async () => {
    const admin = await createUser({ name: "Admin", isAdmin: true });
    const now = Date.now();
    const at = (daysBack: number) => new Date(now - daysBack * 86_400_000);

    await db.insert(events).values([
      {
        parentId: admin.id,
        eventName: "paywall_viewed",
        properties: {},
        sessionId: "sess-1",
        createdAt: at(3),
      },
      {
        parentId: admin.id,
        eventName: "sos_completed",
        properties: {},
        sessionId: "sess-1",
        createdAt: at(2),
      },
      {
        parentId: admin.id,
        eventName: "sos_helpful_rating",
        properties: { helpful: true },
        sessionId: "sess-1",
        createdAt: at(1),
      },
    ]);

    const res = await app.request("/api/admin/analytics/events?days=30", {
      headers: { [TEST_USER_HEADER]: admin.id },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as AnalyticsPayload;

    const rangeCount = (name: string) =>
      body.totalsRange.find((r) => r.eventName === name)?.count ?? 0;
    expect(rangeCount("paywall_viewed")).toBe(1);
    expect(rangeCount("sos_completed")).toBe(1);
    expect(rangeCount("sos_helpful_rating")).toBe(1);

    // The JSONB `helpful=true` filter feeds the 7-day helpful KPI.
    expect(body.derived7d.helpfulYes).toBe(1);
  });
});
