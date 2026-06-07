import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, gte, desc } from "drizzle-orm";
import { db, symptoms } from "@focusflow/db";
import {
  createSymptomSchema,
  updateSymptomSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess, childIsShared } from "../lib/child-access";
import { logAudit, getCreatorNames } from "../lib/audit";
import { getPremiumAccess, FREE_HISTORY_DAYS } from "../lib/premium";
import { getUserTimezone, localISODateDaysAgo } from "../lib/local-date";

function formatFrDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const symptomsRoutes = new Hono<AppEnv>();

symptomsRoutes.use("*", authMiddleware);

symptomsRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 100, 1), 500);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);

  // Free plan only sees the last FREE_HISTORY_DAYS; premium gets full history
  // ("Historique complet de suivi" on the pricing grid).
  const { active: isPremium } = await getPremiumAccess(user.id);
  let where = eq(symptoms.childId, childId);
  if (!isPremium) {
    const tz = await getUserTimezone(user.id);
    const since = localISODateDaysAgo(tz, FREE_HISTORY_DAYS);
    where = and(where, gte(symptoms.date, since))!;
  }

  const result = await db
    .select()
    .from(symptoms)
    .where(where)
    .orderBy(desc(symptoms.date))
    .limit(limit)
    .offset(offset);

  // Creator attribution is only meaningful — and only shown — when the
  // child is co-managed. Skip the audit lookup entirely for a solo parent.
  const creators = (await childIsShared(childId))
    ? await getCreatorNames(childId, "symptom")
    : null;

  return c.json(
    result.map((s) => ({ ...s, createdByName: creators?.get(s.id) ?? null })),
  );
});

symptomsRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createSymptomSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await assertChildAccess(user.id, parsed.data.childId);

  const [symptom] = await db
    .insert(symptoms)
    .values(parsed.data)
    .returning();

  if (symptom) {
    const dateStr = formatFrDate(symptom.date);
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: symptom.childId,
      entityType: "symptom",
      entityId: symptom.id,
      action: "create",
      summary: dateStr
        ? `Symptômes du ${dateStr} enregistrés`
        : "Symptômes enregistrés",
    });
  }

  return c.json(symptom, 201);
});

symptomsRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateSymptomSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [existing] = await db
    .select()
    .from(symptoms)
    .where(eq(symptoms.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Relevé non trouvé", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  const [updated] = await db
    .update(symptoms)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(symptoms.id, id))
    .returning();

  if (!updated) {
    throw new AppError("NOT_FOUND", "Relevé non trouvé", 404);
  }

  const dateStr = formatFrDate(updated.date);
  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: updated.childId,
    entityType: "symptom",
    entityId: updated.id,
    action: "update",
    summary: dateStr
      ? `Symptômes du ${dateStr} mis à jour`
      : "Symptômes mis à jour",
  });

  return c.json(updated);
});

symptomsRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(symptoms)
    .where(eq(symptoms.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Relevé non trouvé", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  await db.delete(symptoms).where(eq(symptoms.id, id));

  const dateStr = formatFrDate(existing.date);
  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: existing.childId,
    entityType: "symptom",
    entityId: existing.id,
    action: "delete",
    summary: dateStr
      ? `Symptômes du ${dateStr} supprimés`
      : "Symptômes supprimés",
  });

  return c.json({ ok: true });
});
