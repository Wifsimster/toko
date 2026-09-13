import { Hono } from "hono";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db, consents } from "@focusflow/db";
import { consentTypeSchema, grantConsentSchema } from "@focusflow/validators";
import type { AppEnv } from "../../types";
import { parseBody } from "../../lib/http/validate";


export const consentsRoutes = new Hono<AppEnv>();

/**
 * Business rule F4: consent management.
 *
 * GET    /api/account/consents          → list the latest non-revoked grant per type
 * POST   /api/account/consents          → record an explicit grant (body: { type, version })
 * DELETE /api/account/consents/:type    → mark the latest grant as revoked
 *
 * Rows are append-only to preserve audit trail; revocation is a timestamp,
 * not a deletion.
 */
consentsRoutes.get("/consents", async (c) => {
  const currentUser = c.get("user");
  const rows = await db
    .select()
    .from(consents)
    .where(and(eq(consents.userId, currentUser.id), isNull(consents.revokedAt)))
    .orderBy(desc(consents.grantedAt));

  // Keep only the most recent active grant per type.
  const latestByType = new Map<string, typeof rows[number]>();
  for (const row of rows) {
    if (!latestByType.has(row.type)) latestByType.set(row.type, row);
  }
  return c.json(Array.from(latestByType.values()));
});

consentsRoutes.post("/consents", async (c) => {
  const currentUser = c.get("user");
  const input = await parseBody(c, grantConsentSchema);

  const [row] = await db
    .insert(consents)
    .values({
      userId: currentUser.id,
      type: input.type,
      version: input.version,
    })
    .returning();

  return c.json(row, 201);
});

consentsRoutes.delete("/consents/:type", async (c) => {
  const currentUser = c.get("user");
  const parsed = consentTypeSchema.safeParse(c.req.param("type"));
  if (!parsed.success) {
    return c.json({ error: "Type de consentement inconnu" }, 400);
  }

  const now = new Date();
  const updated = await db
    .update(consents)
    .set({ revokedAt: now })
    .where(
      and(
        eq(consents.userId, currentUser.id),
        eq(consents.type, parsed.data),
        isNull(consents.revokedAt)
      )
    )
    .returning({ id: consents.id });

  return c.json({ revoked: updated.length });
});
