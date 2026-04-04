import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, gte, sql, inArray, count } from "drizzle-orm";
import {
  db,
  children,
  symptoms,
  journalEntries,
  barkleyBehaviors,
  barkleyBehaviorLogs,
} from "@focusflow/db";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const statsRoutes = new Hono<AppEnv>();

statsRoutes.use("*", authMiddleware);

const PERIOD_DAYS: Record<string, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

statsRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const periodParam = c.req.query("period") ?? "week";
  const days = PERIOD_DAYS[periodParam] ?? 7;

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  const today = new Date().toISOString().split("T")[0]!;
  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

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

  // Streak: consecutive days with at least one symptom entry
  const allSymptoms = await db
    .select({ date: symptoms.date })
    .from(symptoms)
    .where(eq(symptoms.childId, childId));

  const symptomDates = new Set(allSymptoms.map((s) => s.date));
  let streak = 0;
  const todayDate = new Date(today);
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(todayDate);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0]!;
    if (symptomDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  // Days since last entry (for alerts)
  let daysSinceLastEntry: number | null = null;
  if (allSymptoms.length > 0) {
    const sortedDates = [...symptomDates].sort().reverse();
    const lastDate = new Date(sortedDates[0]!);
    daysSinceLastEntry = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
    );
  }

  // Mood trend: compare average of first half vs second half of period
  let moodTrend: "up" | "down" | "stable" | null = null;
  if (periodSymptoms.length >= 4) {
    const half = Math.floor(periodSymptoms.length / 2);
    const firstHalfAvg =
      periodSymptoms.slice(0, half).reduce((s, x) => s + x.mood, 0) / half;
    const secondHalfAvg =
      periodSymptoms.slice(half).reduce((s, x) => s + x.mood, 0) /
      (periodSymptoms.length - half);
    const delta = secondHalfAvg - firstHalfAvg;
    if (delta > 0.5) moodTrend = "up";
    else if (delta < -0.5) moodTrend = "down";
    else moodTrend = "stable";
  }

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

  const mappedSymptoms = periodSymptoms.map((s) => ({
    date: s.date,
    mood: s.mood,
    focus: s.focus,
    agitation: s.agitation,
    impulse: s.impulse,
    sleep: s.sleep,
    social: s.social,
    autonomy: s.autonomy,
  }));

  return c.json({
    streak,
    daysSinceLastEntry,
    moodTrend,
    weeklyStars,
    latestMoodRating: latestJournal?.moodRating ?? null,
    latestJournalEntry: latestJournal
      ? {
          id: latestJournal.id,
          date: latestJournal.date,
          text: latestJournal.text,
          moodRating: latestJournal.moodRating,
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
