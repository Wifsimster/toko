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

// Fixed primary key of the single application-settings row.
const SETTINGS_ID = "global";

// Returns the singleton settings row, creating it with column defaults on
// first access so the table never has to be seeded by a migration.
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

  // A concurrent request won the insert race — read the row it wrote.
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID))
    .limit(1);
  return row;
}

// GET /api/admin/settings — the current application-wide settings.
adminSettingsRoutes.get("/", async (c) => {
  return c.json(await getOrCreateSettings());
});

// PATCH /api/admin/settings — update any subset of the application-wide
// settings. Stamps who saved the change and when.
adminSettingsRoutes.patch("/", async (c) => {
  const me = c.get("user");

  const input = await parseBody(c, updateAppSettingsSchema);

  // Ensure the row exists before the UPDATE so the first save can never
  // silently match zero rows.
  await getOrCreateSettings();

  const [updated] = await db
    .update(appSettings)
    .set({ ...input, updatedAt: new Date(), updatedBy: me.id })
    .where(eq(appSettings.id, SETTINGS_ID))
    .returning();

  return c.json(updated);
});
