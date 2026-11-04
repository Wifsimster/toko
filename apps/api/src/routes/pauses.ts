import { Hono } from "hono";
import { and, count, eq, gte, lte } from "drizzle-orm";
import type { AppEnv } from "../types";
import { db, parentPauses } from "@focusflow/db";
import { createPauseSchema, type Garden } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { getUserTimezone, toLocalISODate } from "../lib/local-date";
import { gardenWeekDates } from "../lib/garden-week";
import { parseBody } from "../lib/http/validate";

export const pauseRoutes = new Hono<AppEnv>();

pauseRoutes.use("*", authMiddleware);

pauseRoutes.get("/garden", async (c) => {
  const user = c.get("user");
  const tz = await getUserTimezone(user.id);
  const today = toLocalISODate(tz);
  const week = gardenWeekDates(today);

  const [total] = await db
    .select({ value: count() })
    .from(parentPauses)
    .where(eq(parentPauses.userId, user.id));

  const rows = await db
    .selectDistinct({ date: parentPauses.date })
    .from(parentPauses)
    .where(
      and(
        eq(parentPauses.userId, user.id),
        gte(parentPauses.date, week[0]!),
        lte(parentPauses.date, week[6]!),
      ),
    );
  const withLeaf = new Set(rows.map((r) => r.date));

  const garden: Garden = {
    leaves: Number(total?.value ?? 0),
    today,
    week: week.map((date) => ({ date, leaf: withLeaf.has(date) })),
  };
  return c.json(garden);
});

pauseRoutes.post("/", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, createPauseSchema);

  const [row] = await db
    .insert(parentPauses)
    .values({
      userId: user.id,
      date: input.date,
      kind: input.kind,
      durationSeconds: input.durationSeconds,
    })
    .returning();

  return c.json(row, 201);
});
