import { Hono } from "hono";
import { eq, and, gte, desc } from "drizzle-orm";
import type { AppEnv } from "../types";
import { db, parentMoodLogs } from "@focusflow/db";
import { upsertParentMoodSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { getUserTimezone, localISODateDaysAgo } from "../lib/local-date";
import { parseBody } from "../lib/http/validate";

export const parentMoodRoutes = new Hono<AppEnv>();

parentMoodRoutes.use("*", authMiddleware);

// Returns the user's most recent N days of mood logs (default 14).
// Used to power the dashboard widget's last-7-days strip + "today
// already logged?" check.
parentMoodRoutes.get("/", async (c) => {
  const user = c.get("user");
  const days = Math.min(Math.max(Number(c.req.query("days")) || 14, 1), 90);
  // Inclusive of "today" — days=14 returns the trailing 14 calendar days.
  const tz = await getUserTimezone(user.id);
  const sinceIso = localISODateDaysAgo(tz, days - 1);

  const rows = await db
    .select()
    .from(parentMoodLogs)
    .where(
      and(
        eq(parentMoodLogs.userId, user.id),
        gte(parentMoodLogs.date, sinceIso),
      ),
    )
    .orderBy(desc(parentMoodLogs.date));

  return c.json(rows);
});

parentMoodRoutes.post("/", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, upsertParentMoodSchema);

  // Upsert on (user_id, date). Re-tapping later in the day overwrites
  // — the value is the LATEST self-report, not the first.
  const [existing] = await db
    .select()
    .from(parentMoodLogs)
    .where(
      and(
        eq(parentMoodLogs.userId, user.id),
        eq(parentMoodLogs.date, input.date),
      ),
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(parentMoodLogs)
      .set({
        score: input.score,
        note: input.note ?? null,
        updatedAt: new Date(),
      })
      .where(eq(parentMoodLogs.id, existing.id))
      .returning();
    return c.json(updated);
  }

  const [inserted] = await db
    .insert(parentMoodLogs)
    .values({
      userId: user.id,
      date: input.date,
      score: input.score,
      note: input.note ?? null,
    })
    .returning();

  return c.json(inserted, 201);
});
