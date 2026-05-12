import { Hono } from "hono";
import { eq, gte, sql } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { db, user, events } from "@focusflow/db";

export const adminAnalyticsRoutes = new Hono<AppEnv>();

adminAnalyticsRoutes.use("*", authMiddleware);

async function assertAdmin(userId: string) {
  const [row] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!row?.isAdmin) {
    throw new AppError("FORBIDDEN", "Action réservée aux admins", 403);
  }
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// GET /api/admin/analytics/events?days=30
//
// Returns per-day event counts over the requested window plus headline
// totals (7d, 30d). The dashboard (#187) renders these directly — no
// north-star derivation here yet. That formula needs an
// `sos_helpful_rating` event that isn't instrumented (follow-up).
adminAnalyticsRoutes.get("/events", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

  const days = Math.min(Math.max(Number(c.req.query("days")) || 30, 1), 90);
  const since = daysAgo(days - 1);
  const since7d = daysAgo(6);

  const byDay = await db
    .select({
      date: sql<string>`to_char(${events.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
      eventName: events.eventName,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(events)
    .where(gte(events.createdAt, since))
    .groupBy(
      sql`to_char(${events.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
      events.eventName,
    )
    .orderBy(
      sql`to_char(${events.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
    );

  const totals7d = await db
    .select({
      eventName: events.eventName,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(events)
    .where(gte(events.createdAt, since7d))
    .groupBy(events.eventName);

  const totalsRange = await db
    .select({
      eventName: events.eventName,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(events)
    .where(gte(events.createdAt, since))
    .groupBy(events.eventName);

  // Derived 7-day KPIs. Computed in SQL with FILTER clauses so a single
  // pass over the (event_name, created_at) index covers everything.
  const [kpi7d] = await db
    .select({
      sosHelpfulYes: sql<number>`cast(count(*) filter (where ${events.eventName} = 'sos_helpful_rating' and ${events.properties} ->> 'helpful' = 'true') as int)`,
      sosHelpfulTotal: sql<number>`cast(count(*) filter (where ${events.eventName} = 'sos_helpful_rating') as int)`,
      paywallViews: sql<number>`cast(count(*) filter (where ${events.eventName} = 'paywall_viewed') as int)`,
      trialsStarted: sql<number>`cast(count(*) filter (where ${events.eventName} = 'trial_started') as int)`,
      activeParents: sql<number>`cast(count(distinct ${events.parentId}) filter (where ${events.parentId} is not null) as int)`,
    })
    .from(events)
    .where(gte(events.createdAt, since7d));

  const helpful = kpi7d?.sosHelpfulYes ?? 0;
  const helpfulTotal = kpi7d?.sosHelpfulTotal ?? 0;
  const paywallViews = kpi7d?.paywallViews ?? 0;
  const trialsStarted = kpi7d?.trialsStarted ?? 0;
  const activeParents = kpi7d?.activeParents ?? 0;

  // "Crises désamorcées par parent actif par semaine" — division by zero
  // returns null so the dashboard can render "—" rather than NaN.
  const derived7d = {
    helpfulYes: helpful,
    helpfulTotal,
    helpfulRate: helpfulTotal > 0 ? helpful / helpfulTotal : null,
    paywallViews,
    trialsStarted,
    paywallToTrialRate: paywallViews > 0 ? trialsStarted / paywallViews : null,
    activeParents,
    northStar: activeParents > 0 ? helpful / activeParents : null,
  };

  return c.json({ days, byDay, totals7d, totalsRange, derived7d });
});
