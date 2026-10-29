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

  if (periodParam !== "week") {
    const denied = await requireChildPlan(c, childId);
    if (denied) return denied;
  }

  const tz = await getUserTimezone(user.id);
  const today = toLocalISODate(tz);
  const sinceDate = localISODateDaysAgo(tz, days - 1);
  const weekAgo = localISODateDaysAgo(tz, 7 - 1);

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

  const [latestJournal] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.childId, childId))
    .orderBy(sql`${journalEntries.date} DESC`, sql`${journalEntries.createdAt} DESC`)
    .limit(1);

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

  const [latestSymptomDate] = await db
    .select({ date: symptoms.date })
    .from(symptoms)
    .where(eq(symptoms.childId, childId))
    .orderBy(sql`${symptoms.date} DESC`)
    .limit(1);

  const daysSince = daysSinceLastEntry(latestSymptomDate?.date, today);

  const trend = moodTrend(periodSymptoms);

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

  const latestSymptom = periodSymptoms.length > 0
    ? periodSymptoms[periodSymptoms.length - 1]!
    : null;

  if (formatParam === "digest") {
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
    weeklySymptoms: mappedSymptoms,
  });
});

statsRoutes.get("/:childId/correlations", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const lookbackDays = 28;

  await assertChildAccess(user.id, childId);

  const denied = await requireChildPlan(c, childId);
  if (denied) return denied;

  const tz = await getUserTimezone(user.id);
  const sinceDate = localISODateDaysAgo(tz, lookbackDays - 1);

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

statsRoutes.get("/:childId/calm-minutes", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const periodParam = c.req.query("period") ?? "week";
  const days = daysForPeriod(periodParam, "week");

  await assertChildAccess(user.id, childId);

  if (periodParam !== "week") {
    const denied = await requireChildPlan(c, childId);
    if (denied) return denied;
  }

  const tz = await getUserTimezone(user.id);
  const sinceDate = localISODateDaysAgo(tz, days - 1);

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
