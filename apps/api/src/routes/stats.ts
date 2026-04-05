import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, gte, sql, inArray, count, desc } from "drizzle-orm";
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

  // Functional Consistency Score (0–100): product of monitoring discipline
  // and stability detection over the selected period.
  //   = (% days with ≥1 symptom entry) × (% of those days that look "ok":
  //      focus|mood ≥ 6 OR agitation|impulse ≤ 4)
  // Rewards BOTH honest tracking and actionable stability — unlike `streak`
  // which rewards showing up even when data is static.
  let consistencyScore: number | null = null;
  if (periodSymptoms.length > 0) {
    const uniqueDates = new Set(periodSymptoms.map((s) => s.date));
    const coverage = uniqueDates.size / days;
    const okDays = periodSymptoms.filter(
      (s) => s.focus >= 6 || s.mood >= 6 || s.agitation <= 4 || s.impulse <= 4
    ).length;
    const stability = okDays / periodSymptoms.length;
    consistencyScore = Math.round(coverage * stability * 100);
  }

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

  return c.json({
    consistencyScore,
    streak,
    daysSinceLastEntry,
    moodTrend,
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

// Behavior ↔ symptom correlation — compares dimension averages on days a
// behavior was completed vs. days it was not. Surfaces the single strongest
// positive correlation once there is enough signal (≥10 logged days total,
// ≥3 completed and ≥3 not-completed days per behavior).
statsRoutes.get("/:childId/correlations", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const lookbackDays = 28; // 4 weeks

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  const sinceDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

  const rows = await db
    .select()
    .from(symptoms)
    .where(
      and(eq(symptoms.childId, childId), gte(symptoms.date, sinceDate))
    );

  if (rows.length < 10) {
    return c.json({ insufficientData: true, insight: null });
  }

  const behaviorRows = await db
    .select()
    .from(barkleyBehaviors)
    .where(
      and(eq(barkleyBehaviors.childId, childId), eq(barkleyBehaviors.active, true))
    )
    .orderBy(desc(barkleyBehaviors.createdAt));

  if (behaviorRows.length === 0) {
    return c.json({ insufficientData: true, insight: null });
  }

  const behaviorIds = behaviorRows.map((b) => b.id);
  const logs = await db
    .select()
    .from(barkleyBehaviorLogs)
    .where(
      and(
        inArray(barkleyBehaviorLogs.behaviorId, behaviorIds),
        gte(barkleyBehaviorLogs.date, sinceDate)
      )
    );

  // Dimensions clinically worth correlating (5 kept after Week 1 cuts)
  const dimensions = ["focus", "mood", "agitation", "impulse", "sleep"] as const;
  const dimensionLabels: Record<(typeof dimensions)[number], string> = {
    focus: "la concentration",
    mood: "l'humeur",
    agitation: "l'agitation",
    impulse: "l'impulsivité",
    sleep: "le sommeil",
  };

  type Insight = {
    behaviorName: string;
    dimension: string;
    dimensionLabel: string;
    onValue: number;
    offValue: number;
    delta: number;
    sampleOn: number;
    sampleOff: number;
  };

  const symptomsByDate = new Map(rows.map((s) => [s.date, s]));
  let best: Insight | null = null;

  for (const behavior of behaviorRows) {
    const behaviorLogs = logs.filter((l) => l.behaviorId === behavior.id);
    const completedDates = new Set(
      behaviorLogs.filter((l) => l.completed).map((l) => l.date)
    );
    const notCompletedDates = new Set(
      behaviorLogs.filter((l) => !l.completed).map((l) => l.date)
    );

    const onDays = [...completedDates]
      .map((d) => symptomsByDate.get(d))
      .filter((s): s is NonNullable<typeof s> => !!s);
    const offDays = [...notCompletedDates]
      .map((d) => symptomsByDate.get(d))
      .filter((s): s is NonNullable<typeof s> => !!s);

    if (onDays.length < 3 || offDays.length < 3) continue;

    for (const dim of dimensions) {
      const onAvg = onDays.reduce((s, x) => s + x[dim], 0) / onDays.length;
      const offAvg = offDays.reduce((s, x) => s + x[dim], 0) / offDays.length;

      // For focus/mood/sleep, higher is better; for agitation/impulse, lower is better
      const higherIsBetter = dim === "focus" || dim === "mood" || dim === "sleep";
      const delta = higherIsBetter ? onAvg - offAvg : offAvg - onAvg;

      // Require meaningful effect size (≥1.5 points on 0-10 scale)
      if (delta < 1.5) continue;

      if (!best || delta > best.delta) {
        best = {
          behaviorName: behavior.name,
          dimension: dim,
          dimensionLabel: dimensionLabels[dim],
          onValue: Math.round(onAvg * 10) / 10,
          offValue: Math.round(offAvg * 10) / 10,
          delta: Math.round(delta * 10) / 10,
          sampleOn: onDays.length,
          sampleOff: offDays.length,
        };
      }
    }
  }

  return c.json({
    insufficientData: !best,
    insight: best,
    lookbackDays,
  });
});
