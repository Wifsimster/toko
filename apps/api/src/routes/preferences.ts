import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq } from "drizzle-orm";
import { db, userPreferences } from "@focusflow/db";
import { updateUserPreferencesSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";

export const preferencesRoutes = new Hono<AppEnv>();

preferencesRoutes.use("*", authMiddleware);

const DEFAULTS = {
  timezone: "Europe/Paris",
  dailyReminderOptIn: true,
  weeklyDigestOptIn: true,
};

preferencesRoutes.get("/", async (c) => {
  const user = c.get("user");
  const [row] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id));

  if (!row) {
    return c.json({ userId: user.id, ...DEFAULTS });
  }
  return c.json({
    userId: row.userId,
    timezone: row.timezone,
    dailyReminderOptIn: row.dailyReminderOptIn,
    weeklyDigestOptIn: row.weeklyDigestOptIn,
  });
});

preferencesRoutes.patch("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = updateUserPreferencesSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  // Upsert — Better Auth doesn't create preference rows itself.
  const [row] = await db
    .insert(userPreferences)
    .values({ userId: user.id, ...DEFAULTS, ...parsed.data })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();

  return c.json(row);
});
