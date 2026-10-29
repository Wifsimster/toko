import { Hono } from "hono";
import type { AppEnv } from "../types";
import { count, eq, inArray, sql } from "drizzle-orm";
import { db, children, childAccess, consents } from "@focusflow/db";
import { createChildSchema, updateChildSchema } from "@focusflow/validators";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { getPremiumAccess } from "../lib/premium";
import { seedBarkleyStarterPack } from "../lib/barkley-defaults";
import {
  OWNER_PARENTAL_AUTHORITY_VERSION,
  OWNER_HEALTH_VERSION,
} from "../lib/consent-versions";
import {
  assertChildAccess,
  assertChildOwner,
  listAccessibleChildIds,
} from "../lib/child-access";
import { logAudit } from "../lib/audit";
import { parseBody } from "../lib/http/validate";

const createChildBodySchema = createChildSchema.extend({
  healthDataConsent: z.boolean().optional(),
});

export const childrenRoutes = new Hono<AppEnv>();

childrenRoutes.use("*", authMiddleware);

childrenRoutes.get("/", async (c) => {
  const user = c.get("user");
  const accessibleIds = await listAccessibleChildIds(user.id);
  if (accessibleIds.length === 0) {
    return c.json([]);
  }
  const result = await db
    .select()
    .from(children)
    .where(inArray(children.id, accessibleIds));
  return c.json(result);
});

childrenRoutes.post("/", async (c) => {
  const user = c.get("user");
  const { healthDataConsent, ...input } = await parseBody(
    c,
    createChildBodySchema,
  );

  if (healthDataConsent !== true) {
    return c.json(
      {
        error:
          "Le consentement au traitement des données de santé de l'enfant est requis.",
      },
      422
    );
  }

  const { active: isActive } = await getPremiumAccess(user.id);
  const maxChildren = isActive ? 3 : 1;

  const child = await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${`children:${user.id}`}))`,
    );
    const [existing] = await tx
      .select({ total: count() })
      .from(children)
      .where(eq(children.parentId, user.id));

    if ((existing?.total ?? 0) >= maxChildren) {
      throw new AppError(
        "FORBIDDEN",
        isActive
          ? "Limite de 3 profils enfant atteinte pour le plan Famille."
          : "Limite de 1 profil enfant atteinte. Passez au plan Famille pour en ajouter jusqu'à 3.",
        403
      );
    }

    const [created] = await tx
      .insert(children)
      .values({ ...input, parentId: user.id })
      .returning();
    if (!created) throw new AppError("INTERNAL", "Échec de création", 500);
    await tx.insert(childAccess).values({
      childId: created.id,
      userId: user.id,
      role: "owner",
      grantedBy: user.id,
    });
    await tx.insert(consents).values([
      {
        userId: user.id,
        type: "parental_authority_attestation",
        version: OWNER_PARENTAL_AUTHORITY_VERSION,
      },
      {
        userId: user.id,
        type: "owner_health_processing",
        version: OWNER_HEALTH_VERSION,
      },
    ]);
    await seedBarkleyStarterPack(created.id, tx);
    return created;
  });

  return c.json(child, 201);
});

childrenRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  await assertChildAccess(user.id, id);

  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, id));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  return c.json(child);
});

childrenRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const input = await parseBody(c, updateChildSchema);

  await assertChildAccess(user.id, id);

  const [updated] = await db
    .update(children)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(children.id, id))
    .returning();

  if (!updated) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: updated.id,
    entityType: "child",
    entityId: updated.id,
    action: "update",
    summary: "Profil de l'enfant mis à jour",
  });

  return c.json(updated);
});

childrenRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  await assertChildOwner(user.id, id);

  const deleted = await db
    .delete(children)
    .where(eq(children.id, id))
    .returning({ id: children.id });

  if (deleted.length === 0) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: id,
    entityType: "child",
    entityId: id,
    action: "delete",
    summary: "Profil de l'enfant supprimé",
  });

  return c.json({ ok: true });
});
