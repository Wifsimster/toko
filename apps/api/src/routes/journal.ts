import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, gte, desc } from "drizzle-orm";
import { db, journalEntries } from "@focusflow/db";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import {
  assertChildAccess,
  childIsShared,
  getChildOwnerId,
} from "../lib/child-access";
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

export const journalRoutes = new Hono<AppEnv>();

journalRoutes.use("*", authMiddleware);

journalRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 100, 1), 500);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);

  // Free plan only sees the last FREE_HISTORY_DAYS; premium gets full history
  // ("Historique complet de suivi" on the pricing grid). Gated on the child
  // OWNER's plan so a co-parent inherits full history when the owner has
  // Famille (mirrors report.ts).
  const ownerId = (await getChildOwnerId(childId)) ?? user.id;
  const { active: isPremium } = await getPremiumAccess(ownerId);
  let where = eq(journalEntries.childId, childId);
  if (!isPremium) {
    const tz = await getUserTimezone(user.id);
    const since = localISODateDaysAgo(tz, FREE_HISTORY_DAYS);
    where = and(where, gte(journalEntries.date, since))!;
  }

  const result = await db
    .select()
    .from(journalEntries)
    .where(where)
    .orderBy(desc(journalEntries.date))
    .limit(limit)
    .offset(offset);

  // Creator attribution is only meaningful — and only shown — when the
  // child is co-managed. Skip the audit lookup entirely for a solo parent.
  const creators = (await childIsShared(childId))
    ? await getCreatorNames(childId, "journal")
    : null;

  return c.json(
    result.map((e) => ({ ...e, createdByName: creators?.get(e.id) ?? null })),
  );
});

journalRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const parsed = createJournalEntrySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await assertChildAccess(user.id, parsed.data.childId);

  const [entry] = await db
    .insert(journalEntries)
    .values(parsed.data)
    .returning();

  if (entry) {
    const dateStr = formatFrDate(entry.date);
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: entry.childId,
      entityType: "journal",
      entityId: entry.id,
      action: "create",
      summary: dateStr
        ? `Journal du ${dateStr} ajouté`
        : "Entrée du journal ajoutée",
    });
  }

  return c.json(entry, 201);
});

journalRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateJournalEntrySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [existing] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Entrée non trouvée", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  const [updated] = await db
    .update(journalEntries)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(journalEntries.id, id))
    .returning();

  if (updated) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: updated.childId,
      entityType: "journal",
      entityId: updated.id,
      action: "update",
      summary: "Entrée du journal modifiée",
    });
  }

  return c.json(updated);
});

journalRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Entrée non trouvée", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  await db.delete(journalEntries).where(eq(journalEntries.id, id));

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: existing.childId,
    entityType: "journal",
    entityId: existing.id,
    action: "delete",
    summary: "Entrée du journal supprimée",
  });

  return c.json({ ok: true });
});
