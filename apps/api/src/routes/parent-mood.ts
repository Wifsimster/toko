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

parentMoodRoutes.get("/", async (c) => {
  const user = c.get("user");
  const days = Math.min(Math.max(Number(c.req.query("days")) || 14, 1), 90);
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

  const [row] = await db
    .insert(parentMoodLogs)
    .values({
      userId: user.id,
      date: input.date,
      score: input.score,
      note: input.note ?? null,
    })
    .onConflictDoUpdate({
      target: [parentMoodLogs.userId, parentMoodLogs.date],
      set: {
        score: input.score,
        note: input.note ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  const created = row!.createdAt.getTime() === row!.updatedAt.getTime();
  return c.json(row, created ? 201 : 200);
});
