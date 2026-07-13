import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, inArray } from "drizzle-orm";
import { db, children, childAccess, consents } from "@focusflow/db";
import { createChildSchema, updateChildSchema } from "@focusflow/validators";
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
  const body = await c.req.json().catch(() => ({}));
  const parsed = createChildSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  // RGPD Art. 9(2)(a): the owner must explicitly consent to processing their
  // child's health data (and attest parental authority) before we create the
  // profile. The UI gates the submit button on a required checkbox; we also
  // enforce it server-side so the consent proof is never missing.
  if (body?.healthDataConsent !== true) {
    return c.json(
      {
        error:
          "Le consentement au traitement des données de santé de l'enfant est requis.",
      },
      422
    );
  }

  // Enforce child limit based on subscription plan
  const existingChildren = await db
    .select()
    .from(children)
    .where(eq(children.parentId, user.id));

  const { active: isActive } = await getPremiumAccess(user.id);
  const maxChildren = isActive ? 3 : 1;

  if (existingChildren.length >= maxChildren) {
    throw new AppError(
      "FORBIDDEN",
      isActive
        ? "Limite de 3 profils enfant atteinte pour le plan Famille."
        : "Limite de 1 profil enfant atteinte. Passez au plan Famille pour en ajouter jusqu'à 3.",
      403
    );
  }

  const child = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(children)
      .values({ ...parsed.data, parentId: user.id })
      .returning();
    if (!created) throw new AppError("INTERNAL", "Échec de création", 500);
    await tx.insert(childAccess).values({
      childId: created.id,
      userId: user.id,
      role: "owner",
      grantedBy: user.id,
    });
    // Persist the owner's Art. 9 health-data consent and parental-authority
    // attestation alongside the child, in the same transaction.
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
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateChildSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await assertChildAccess(user.id, id);

  const [updated] = await db
    .update(children)
    .set({ ...parsed.data, updatedAt: new Date() })
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
