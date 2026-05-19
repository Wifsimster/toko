import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { updateAppSettingsSchema } from "@focusflow/validators";
import { db, user, appSettings } from "@focusflow/db";

export const adminSettingsRoutes = new Hono<AppEnv>();

adminSettingsRoutes.use("*", authMiddleware);

// Fixed primary key of the single application-settings row.
const SETTINGS_ID = "global";

async function assertAdmin(userId: string) {
  const [row] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!row?.isAdmin) {
    throw new AppError("FORBIDDEN", "Action réservée aux admins", 403);
  }
}

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
  const me = c.get("user");
  await assertAdmin(me.id);

  return c.json(await getOrCreateSettings());
});

// PATCH /api/admin/settings — update any subset of the application-wide
// settings. Stamps who saved the change and when.
adminSettingsRoutes.patch("/", async (c) => {
  const me = c.get("user");
  await assertAdmin(me.id);

  const body = await c.req.json().catch(() => ({}));
  const parsed = updateAppSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Payload invalide", issues: parsed.error.issues },
      422,
    );
  }

  // Ensure the row exists before the UPDATE so the first save can never
  // silently match zero rows.
  await getOrCreateSettings();

  const [updated] = await db
    .update(appSettings)
    .set({ ...parsed.data, updatedAt: new Date(), updatedBy: me.id })
    .where(eq(appSettings.id, SETTINGS_ID))
    .returning();

  return c.json(updated);
});
