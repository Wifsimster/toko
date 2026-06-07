import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, desc, sql } from "drizzle-orm";
import { db, companionDiscoveries } from "@focusflow/db";
import { recordCompanionDiscoverySchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { assertChildAccess } from "../lib/child-access";

export const companionsRoutes = new Hono<AppEnv>();

companionsRoutes.use("*", authMiddleware);

companionsRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const result = await db
    .select()
    .from(companionDiscoveries)
    .where(eq(companionDiscoveries.childId, childId))
    .orderBy(desc(companionDiscoveries.discoveredAt));

  return c.json(result);
});

companionsRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = recordCompanionDiscoverySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  await assertChildAccess(user.id, parsed.data.childId);

  // Meeting the same animal again increments its discovery count (the unique
  // (childId, animalId) index makes this an upsert). count === 1 means it's a
  // brand-new companion; > 1 means a happy reunion.
  const [entry] = await db
    .insert(companionDiscoveries)
    .values(parsed.data)
    .onConflictDoUpdate({
      target: [companionDiscoveries.childId, companionDiscoveries.animalId],
      set: { count: sql`${companionDiscoveries.count} + 1` },
    })
    .returning();

  const count = entry?.count ?? 1;
  return c.json({ alreadyDiscovered: count > 1, count });
});
