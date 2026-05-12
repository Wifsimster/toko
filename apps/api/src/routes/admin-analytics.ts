import { Hono } from "hono";
import { eq, gte, sql } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { db, user, events, subscription } from "@focusflow/db";

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

  // Time-to-aha over the same window — median + p75 seconds between
  // signup (user.created_at, the most reliable source) and the first
  // sos_helpful_rating with helpful=true. Also computes the D7 reach
  // rate on a stable cohort (signed up at least 7d ago) so a sudden
  // drop in fresh signups doesn't move the number.
  const since7dCohort = daysAgo(days - 1);
  const cohortCutoff = daysAgo(6); // need 7d of observation window

  const ahaRows = await db.execute<{
    median_seconds: number | null;
    p75_seconds: number | null;
    users_reached: number;
  }>(sql`
    with first_aha as (
      select
        u.id as user_id,
        u.created_at as signup_at,
        min(e.created_at) as aha_at
      from "user" u
      inner join events e
        on e.parent_id = u.id
        and e.event_name = 'sos_helpful_rating'
        and e.properties ->> 'helpful' = 'true'
      where u.created_at >= ${since7dCohort}
      group by u.id, u.created_at
    )
    select
      cast(extract(epoch from percentile_cont(0.5) within group (order by (aha_at - signup_at))) as int) as median_seconds,
      cast(extract(epoch from percentile_cont(0.75) within group (order by (aha_at - signup_at))) as int) as p75_seconds,
      cast(count(*) as int) as users_reached
    from first_aha
  `);

  const [cohortRow] = await db
    .select({
      signups: sql<number>`cast(count(*) as int)`,
      reachedD7: sql<number>`cast(count(*) filter (
        where exists (
          select 1 from ${events} e
          where e.parent_id = ${user.id}
            and e.event_name = 'sos_helpful_rating'
            and e.properties ->> 'helpful' = 'true'
            and e.created_at <= ${user.createdAt} + interval '7 days'
        )
      ) as int)`,
    })
    .from(user)
    .where(
      sql`${user.createdAt} >= ${since7dCohort} and ${user.createdAt} < ${cohortCutoff}`,
    );

  // postgres-js returns an array-like RowList; first row holds the aggregate.
  const ahaStats = ahaRows[0] ?? null;
  const cohortSignups = cohortRow?.signups ?? 0;
  const reachedD7 = cohortRow?.reachedD7 ?? 0;

  const timeToAha = {
    medianSeconds: ahaStats?.median_seconds ?? null,
    p75Seconds: ahaStats?.p75_seconds ?? null,
    usersReached: ahaStats?.users_reached ?? 0,
    cohortSignups,
    reachedD7,
    reachRateD7: cohortSignups > 0 ? reachedD7 / cohortSignups : null,
  };

  // Paid-cohort metrics. We pair the Stripe state mirror (`subscription`
  // table) with the analytics events table:
  // - `activeSubs` from subscription.status = 'active' or 'trialing'
  // - `started30d` / `canceled30d` from event counts so the formulae
  //   don't require a separate Stripe cron — the webhook already
  //   writes both sides.
  const since30d = daysAgo(29);

  const [paidNow] = await db
    .select({
      count: sql<number>`cast(count(*) filter (where ${subscription.status} in ('active', 'trialing')) as int)`,
    })
    .from(subscription);

  const [subEvents30d] = await db
    .select({
      started: sql<number>`cast(count(*) filter (where ${events.eventName} = 'subscription_started') as int)`,
      canceled: sql<number>`cast(count(*) filter (where ${events.eventName} = 'subscription_canceled') as int)`,
    })
    .from(events)
    .where(gte(events.createdAt, since30d));

  const activeSubs = paidNow?.count ?? 0;
  const subsStarted30d = subEvents30d?.started ?? 0;
  const subsCanceled30d = subEvents30d?.canceled ?? 0;
  // Crude monthly churn: cancellations over the average book size in
  // the same window. activeSubs is the closing snapshot, so we use it
  // as the denominator. Returns null if there's no book yet so the UI
  // renders "—" rather than NaN.
  const monthlyChurnRate =
    activeSubs > 0 ? subsCanceled30d / activeSubs : null;
  // LTV proxy = 1 / churn (months). Without a churn signal we have no
  // basis to extrapolate.
  const ltvMonths =
    monthlyChurnRate && monthlyChurnRate > 0 ? 1 / monthlyChurnRate : null;

  const paid30d = {
    activeSubs,
    subsStarted30d,
    subsCanceled30d,
    monthlyChurnRate,
    ltvMonths,
  };

  // Invisible-churn signals (#191). We don't have a session_started
  // event yet, so "no activity" is approximated by "no event in the
  // events table for this parentId in the last 14 days". This misses
  // browsing without a tracked action — acceptable as a first cut.
  const since14d = daysAgo(13);
  const eligibleSince = daysAgo(13);
  const oldestCohort = daysAgo(60);

  const [churnRow] = await db
    .select({
      // Signed up >14d ago, ≤60d ago (cohort with enough watch window
      // but recent enough to be relevant) and no event in last 14d.
      disengaged: sql<number>`cast(count(*) filter (
        where ${user.createdAt} < ${eligibleSince}
          and ${user.createdAt} >= ${oldestCohort}
          and not exists (
            select 1 from ${events} e
            where e.parent_id = ${user.id}
              and e.created_at >= ${since14d}
          )
      ) as int)`,
      // Same cohort denominator.
      eligible: sql<number>`cast(count(*) filter (
        where ${user.createdAt} < ${eligibleSince}
          and ${user.createdAt} >= ${oldestCohort}
      ) as int)`,
    })
    .from(user);

  // Users who fired sos_completed but never sos_helpful_rating.
  // Strong signal that the SOS experience didn't land — the user
  // closed the screen without telling us whether it helped.
  const [silentSos] = await db.execute<{ silent: number; total: number }>(sql`
    with sos_users as (
      select distinct parent_id
      from events
      where event_name = 'sos_completed'
        and parent_id is not null
    ),
    rated_users as (
      select distinct parent_id
      from events
      where event_name = 'sos_helpful_rating'
        and parent_id is not null
    )
    select
      cast(count(*) filter (where rated_users.parent_id is null) as int) as silent,
      cast(count(*) as int) as total
    from sos_users
    left join rated_users on sos_users.parent_id = rated_users.parent_id
  `);

  // Users who saw the paywall ≥7 days ago but never started a trial.
  const paywallCutoff = daysAgo(6);
  const [paywallStall] = await db.execute<{
    stalled: number;
    total: number;
  }>(sql`
    with paywall_users as (
      select parent_id, min(created_at) as first_view
      from events
      where event_name = 'paywall_viewed'
        and parent_id is not null
      group by parent_id
    ),
    trial_users as (
      select distinct parent_id
      from events
      where event_name = 'trial_started'
        and parent_id is not null
    )
    select
      cast(count(*) filter (
        where trial_users.parent_id is null
          and paywall_users.first_view < ${paywallCutoff}
      ) as int) as stalled,
      cast(count(*) filter (where paywall_users.first_view < ${paywallCutoff}) as int) as total
    from paywall_users
    left join trial_users on paywall_users.parent_id = trial_users.parent_id
  `);

  const disengaged = churnRow?.disengaged ?? 0;
  const eligibleCohort = churnRow?.eligible ?? 0;
  const silentSosCount = silentSos?.silent ?? 0;
  const sosUserTotal = silentSos?.total ?? 0;
  const paywallStallCount = paywallStall?.stalled ?? 0;
  const paywallStallTotal = paywallStall?.total ?? 0;

  const churnSignals = {
    disengaged,
    eligibleCohort,
    disengagedRate:
      eligibleCohort > 0 ? disengaged / eligibleCohort : null,
    silentSos: silentSosCount,
    sosUserTotal,
    silentSosRate: sosUserTotal > 0 ? silentSosCount / sosUserTotal : null,
    paywallStall: paywallStallCount,
    paywallStallTotal,
    paywallStallRate:
      paywallStallTotal > 0 ? paywallStallCount / paywallStallTotal : null,
  };

  // Threshold alerts. Inline on the dashboard rather than wired to
  // email/Slack: the surface is already admin-only and refreshed
  // manually, so a noisy push channel would add cost without recall.
  // Targets come straight from #178 / #187 / #191 acceptance criteria.
  const alerts: Array<{ level: "warn" | "critical"; message: string }> = [];
  if (timeToAha.medianSeconds !== null && timeToAha.medianSeconds > 7 * 86400) {
    alerts.push({
      level: "warn",
      message:
        "Time-to-aha médian > 7 jours — cible 7 j. Vérifier le parcours d'onboarding.",
    });
  }
  if (
    timeToAha.cohortSignups >= 20 &&
    timeToAha.reachRateD7 !== null &&
    timeToAha.reachRateD7 < 0.2
  ) {
    alerts.push({
      level: "critical",
      message:
        "Taux d'aha à J+7 < 20 % sur ≥ 20 signups — cible 50 %. Risque W4 retention < 20 %.",
    });
  }
  if (monthlyChurnRate !== null && monthlyChurnRate > 0.06) {
    alerts.push({
      level: monthlyChurnRate > 0.1 ? "critical" : "warn",
      message: `Churn mensuel payant ${(monthlyChurnRate * 100).toFixed(1)} % — cible < 6 %.`,
    });
  }
  if (
    churnSignals.eligibleCohort >= 20 &&
    churnSignals.disengagedRate !== null &&
    churnSignals.disengagedRate > 0.5
  ) {
    alerts.push({
      level: "warn",
      message: `Plus de 50 % des inscrits hors période d'observation sont silencieux depuis 14 j (${disengaged}/${eligibleCohort}). Boucle de réengagement à envisager.`,
    });
  }
  if (
    churnSignals.sosUserTotal >= 20 &&
    churnSignals.silentSosRate !== null &&
    churnSignals.silentSosRate > 0.7
  ) {
    alerts.push({
      level: "warn",
      message: `${(churnSignals.silentSosRate * 100).toFixed(0)} % des utilisateurs ont déclenché un S.O.S. sans jamais le noter. Le tap "Ça a aidé ?" est peut-être trop discret.`,
    });
  }

  return c.json({
    days,
    byDay,
    churnSignals,
    totals7d,
    totalsRange,
    derived7d,
    timeToAha,
    paid30d,
    alerts,
  });
});
