import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, desc } from "drizzle-orm";
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

  // Meeting the same animal twice must never error or duplicate — the unique
  // (childId, animalId) index turns a repeat into a no-op. An empty result
  // row means the companion was already discovered.
  const [entry] = await db
    .insert(companionDiscoveries)
    .values(parsed.data)
    .onConflictDoNothing()
    .returning();

  return c.json({ alreadyDiscovered: !entry });
});
