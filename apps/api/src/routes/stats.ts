import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, gte, sql } from "drizzle-orm";
import {
  db,
  children,
  symptoms,
  journalEntries,
} from "@focusflow/db";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const statsRoutes = new Hono<AppEnv>();

statsRoutes.use("*", authMiddleware);

statsRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  const today = new Date().toISOString().split("T")[0]!;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

  // Weekly symptoms
  const weeklySymptoms = await db
    .select()
    .from(symptoms)
    .where(
      and(
        eq(symptoms.childId, childId),
        gte(symptoms.date, sevenDaysAgo)
      )
    );

  // Latest mood from journal
  const latestJournal = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.childId, childId))
    .orderBy(sql`${journalEntries.date} DESC`)
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

  return c.json({
    streak,
    latestMoodRating: latestJournal[0]?.moodRating ?? null,
    weeklySymptoms: weeklySymptoms.map((s) => ({
      date: s.date,
      mood: s.mood,
      focus: s.focus,
      agitation: s.agitation,
      impulse: s.impulse,
      sleep: s.sleep,
      social: s.social,
      autonomy: s.autonomy,
    })),
  });
});
