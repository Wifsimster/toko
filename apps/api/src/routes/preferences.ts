import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq } from "drizzle-orm";
import { db, userPreferences } from "@focusflow/db";
import { updateUserPreferencesSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { parseBody } from "../lib/http/validate";

export const preferencesRoutes = new Hono<AppEnv>();

preferencesRoutes.use("*", authMiddleware);

const DEFAULTS = {
  timezone: "Europe/Paris",
  dailyReminderOptIn: false,
  weeklyDigestOptIn: false,
  coParentActivityOptIn: false,
  morningReminderTime: "09:00",
  eveningReminderTime: "20:30",
  eveningReminderOptIn: false,
  formationReminderOptIn: true,
  mobileTabs: null as string[] | null,
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
    coParentActivityOptIn: row.coParentActivityOptIn,
    morningReminderTime: row.morningReminderTime,
    eveningReminderTime: row.eveningReminderTime,
    eveningReminderOptIn: row.eveningReminderOptIn,
    formationReminderOptIn: row.formationReminderOptIn,
    mobileTabs: row.mobileTabs ?? null,
  });
});

preferencesRoutes.patch("/", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, updateUserPreferencesSchema);

  const [row] = await db
    .insert(userPreferences)
    .values({ userId: user.id, ...DEFAULTS, ...input })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { ...input, updatedAt: new Date() },
    })
    .returning();

  return c.json(row);
});
