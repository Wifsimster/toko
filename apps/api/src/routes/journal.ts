import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, desc } from "drizzle-orm";
import { db, journalEntries } from "@focusflow/db";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess } from "../lib/child-access";
import { logAudit } from "../lib/audit";

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

  const result = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.childId, childId))
    .orderBy(desc(journalEntries.date))
    .limit(limit)
    .offset(offset);

  return c.json(result);
});

journalRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
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
  const body = await c.req.json();
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
