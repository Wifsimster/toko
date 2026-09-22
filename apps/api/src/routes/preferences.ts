import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq } from "drizzle-orm";
import { db, userPreferences } from "@focusflow/db";
import { updateUserPreferencesSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { parseBody } from "../lib/http/validate";

export const preferencesRoutes = new Hono<AppEnv>();

preferencesRoutes.use("*", authMiddleware);

// Mirrors the column defaults in user-preferences.ts: reminder/digest
// emails are opt-in (RGPD/ePrivacy), so a first PATCH on one setting must
// not silently subscribe the user to the others.
const DEFAULTS = {
  timezone: "Europe/Paris",
  dailyReminderOptIn: false,
  weeklyDigestOptIn: false,
  coParentActivityOptIn: false,
  morningReminderTime: "09:00",
  eveningReminderTime: "20:30",
  eveningReminderOptIn: false,
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
  });
});

preferencesRoutes.patch("/", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, updateUserPreferencesSchema);

  // Upsert — Better Auth doesn't create preference rows itself.
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
