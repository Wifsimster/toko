import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, gte, sql, inArray, count, desc } from "drizzle-orm";
import {
  db,
  symptoms,
  journalEntries,
  barkleyBehaviors,
  barkleyBehaviorLogs,
} from "@focusflow/db";
import { authMiddleware } from "../middleware/auth";
import { requireChildPlan } from "../middleware/require-plan";
import { assertChildAccess } from "../lib/child-access";
import { aggregateDailyCalmMinutes, CALM_MINUTES_DAILY_CAP } from "../lib/calm-minutes";
import { daysForPeriod } from "../lib/periods";
import {
  bestAndHardestDay,
  consistencyScore,
  currentStreak,
  daysSinceLastEntry,
  moodTrend,
  topJournalTags,
} from "../lib/stats/metrics";
import {
  findStrongestCorrelation,
  MIN_SYMPTOM_DAYS,
} from "../lib/stats/correlation";
import {
  getUserTimezone,
  localISODateDaysAgo,
  toLocalISODate,
} from "../lib/local-date";

export const statsRoutes = new Hono<AppEnv>();

statsRoutes.use("*", authMiddleware);

statsRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const periodParam = c.req.query("period") ?? "week";
  const formatParam = c.req.query("format");
  const days = daysForPeriod(periodParam, "week");

  await assertChildAccess(user.id, childId);

  // Month/quarter trends require an active subscription — the child OWNER's,
  // so a co-parent inherits them (mirrors report.ts / journal.ts / symptoms.ts).
  // Checked after the access assert so an unknown child id still answers 404.
  if (periodParam !== "week") {
    const denied = await requireChildPlan(c, childId);
    if (denied) return denied;
  }

  // Calendar dates are compared against `s.date` columns the frontend writes
  // in the user's local day, so resolve them in the same timezone — UTC math
  // would skew the window by a day around midnight in France.
  const tz = await getUserTimezone(user.id);
  const today = toLocalISODate(tz);
  const sinceDate = localISODateDaysAgo(tz, days);
  const weekAgo = localISODateDaysAgo(tz, 7);

  // Period symptoms (for chart)
  const periodSymptoms = await db
    .select()
    .from(symptoms)
    .where(
      and(
        eq(symptoms.childId, childId),
        gte(symptoms.date, sinceDate)
      )
    )
    .orderBy(symptoms.date);

  // Latest mood + latest journal entry (for widget)
  const [latestJournal] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.childId, childId))
    .orderBy(sql`${journalEntries.date} DESC`, sql`${journalEntries.createdAt} DESC`)
    .limit(1);

  // Streak: consecutive days with at least one symptom entry.
  // Bounded to the last 365 days — the loop below only looks that far back anyway.
  const yearAgo = localISODateDaysAgo(tz, 365);
  const streakSymptomDates = await db
    .select({ date: symptoms.date })
    .from(symptoms)
    .where(
      and(
        eq(symptoms.childId, childId),
        gte(symptoms.date, yearAgo)
      )
    );

  const streak = currentStreak(
    streakSymptomDates.map((s) => s.date),
    today,
  );

  // Days since last entry (for alerts) — one row, served by (child_id, date) index.
  const [latestSymptomDate] = await db
    .select({ date: symptoms.date })
    .from(symptoms)
    .where(eq(symptoms.childId, childId))
    .orderBy(sql`${symptoms.date} DESC`)
    .limit(1);

  const daysSince = daysSinceLastEntry(latestSymptomDate?.date, today);

  const trend = moodTrend(periodSymptoms);

  // Weekly Barkley stars (completed behaviors in last 7 days)
  const behaviors = await db
    .select({ id: barkleyBehaviors.id })
    .from(barkleyBehaviors)
    .where(eq(barkleyBehaviors.childId, childId));

  let weeklyStars = 0;
  if (behaviors.length > 0) {
    const behaviorIds = behaviors.map((b) => b.id);
    const [result] = await db
      .select({ total: count() })
      .from(barkleyBehaviorLogs)
      .where(
        and(
          inArray(barkleyBehaviorLogs.behaviorId, behaviorIds),
          eq(barkleyBehaviorLogs.completed, true),
          gte(barkleyBehaviorLogs.date, weekAgo)
        )
      );
    weeklyStars = result?.total ?? 0;
  }

  const consistency = consistencyScore(periodSymptoms, days);

  const mappedSymptoms = periodSymptoms.map((s) => ({
    date: s.date,
    mood: s.mood,
    focus: s.focus,
    agitation: s.agitation,
    impulse: s.impulse,
    sleep: s.sleep,
  }));

  // Latest mood comes from the most recent symptom entry (single source of truth)
  const latestSymptom = periodSymptoms.length > 0
    ? periodSymptoms[periodSymptoms.length - 1]!
    : null;

  // Digest format: trimmed payload with pattern highlights for email/digest consumers
  if (formatParam === "digest") {
    // Top 3 journal tags in period
    const periodJournals = await db
      .select({ tags: journalEntries.tags })
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.childId, childId),
          gte(journalEntries.date, sinceDate)
        )
      );
    const topTags = topJournalTags(periodJournals);
    const { bestDay, hardestDay } = bestAndHardestDay(periodSymptoms);

    return c.json({
      consistencyScore: consistency,
      streak,
      moodTrend: trend,
      entriesLogged: periodSymptoms.length,
      weeklyStars,
      topTags,
      bestDay,
      hardestDay,
      period: periodParam,
      periodDays: days,
    });
  }

  return c.json({
    consistencyScore: consistency,
    streak,
    daysSinceLastEntry: daysSince,
    moodTrend: trend,
    weeklyStars,
    latestMood: latestSymptom?.mood ?? null,
    latestJournalEntry: latestJournal
      ? {
        id: latestJournal.id,
        date: latestJournal.date,
        text: latestJournal.text,
        tags: latestJournal.tags,
      }
      : null,
    period: periodParam,
    periodDays: days,
    symptoms: mappedSymptoms,
    // Backwards-compatible alias
    weeklySymptoms: mappedSymptoms,
  });
});

// Compares dimension averages on days a behavior was completed vs not.
// Returns the strongest positive correlation (delta ≥1.5 on 0-10 scale).
statsRoutes.get("/:childId/correlations", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const lookbackDays = 28; // 4 weeks

  await assertChildAccess(user.id, childId);

  // Behaviour/well-being correlation is a Plan Famille feature, gated on the
  // child owner's subscription so a co-parent isn't locked out of it.
  const denied = await requireChildPlan(c, childId);
  if (denied) return denied;

  const tz = await getUserTimezone(user.id);
  const sinceDate = localISODateDaysAgo(tz, lookbackDays);

  const [rows, behaviorRows] = await Promise.all([
    db
      .select()
      .from(symptoms)
      .where(and(eq(symptoms.childId, childId), gte(symptoms.date, sinceDate))),
    db
      .select()
      .from(barkleyBehaviors)
      .where(
        and(
          eq(barkleyBehaviors.childId, childId),
          eq(barkleyBehaviors.active, true)
        )
      )
      .orderBy(desc(barkleyBehaviors.createdAt)),
  ]);

  // Skip the log fetch entirely when the pure analysis could not produce an
  // insight from it anyway — the thresholds themselves live with the
  // analysis, this is only about not issuing a query for nothing.
  const needsLogs =
    rows.length >= MIN_SYMPTOM_DAYS && behaviorRows.length > 0;
  const logs = needsLogs
    ? await db
        .select()
        .from(barkleyBehaviorLogs)
        .where(
          and(
            inArray(
              barkleyBehaviorLogs.behaviorId,
              behaviorRows.map((b) => b.id),
            ),
            gte(barkleyBehaviorLogs.date, sinceDate),
          ),
        )
    : [];

  const best = findStrongestCorrelation(rows, behaviorRows, logs);

  return c.json({
    insufficientData: !best,
    insight: best,
    lookbackDays,
  });
});

// Business rule H1: north-star KPI — minutes de calme gagnées par soir.
// Aggregates the explainable score (see lib/calm-minutes.ts) over the
// requested period and returns daily breakdown + total + average-per-day.
statsRoutes.get("/:childId/calm-minutes", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const periodParam = c.req.query("period") ?? "week";
  const days = daysForPeriod(periodParam, "week");

  await assertChildAccess(user.id, childId);

  const tz = await getUserTimezone(user.id);
  const sinceDate = localISODateDaysAgo(tz, days);

  const rows = await db
    .select({
      date: symptoms.date,
      routinesOk: symptoms.routinesOk,
      agitation: symptoms.agitation,
      mood: symptoms.mood,
      focus: symptoms.focus,
      impulse: symptoms.impulse,
    })
    .from(symptoms)
    .where(and(eq(symptoms.childId, childId), gte(symptoms.date, sinceDate)));

  const daily = aggregateDailyCalmMinutes(rows);
  const totalMinutes = daily.reduce((sum, d) => sum + d.minutes, 0);
  const averagePerDay = daily.length > 0
    ? Math.round(totalMinutes / daily.length)
    : 0;

  return c.json({
    period: periodParam,
    periodDays: days,
    dailyCapMinutes: CALM_MINUTES_DAILY_CAP,
    totalMinutes,
    averagePerDay,
    daysWithEntry: daily.length,
    daily,
  });
});
