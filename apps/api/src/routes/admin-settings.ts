import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { requireAdmin } from "../middleware/require-admin";
import { updateAppSettingsSchema } from "@focusflow/validators";
import { db, appSettings } from "@focusflow/db";
import { parseBody } from "../lib/http/validate";

export const adminSettingsRoutes = new Hono<AppEnv>();

adminSettingsRoutes.use("*", authMiddleware);
adminSettingsRoutes.use("*", requireAdmin);

const SETTINGS_ID = "global";

async function getOrCreateSettings() {
  const [existing] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID))
    .limit(1);
  return row;
}

adminSettingsRoutes.get("/", async (c) => {
  return c.json(await getOrCreateSettings());
});

adminSettingsRoutes.patch("/", async (c) => {
  const me = c.get("user");

  const input = await parseBody(c, updateAppSettingsSchema);

  await getOrCreateSettings();

  const [updated] = await db
    .update(appSettings)
    .set({ ...input, updatedAt: new Date(), updatedBy: me.id })
    .where(eq(appSettings.id, SETTINGS_ID))
    .returning();

  return c.json(updated);
});
