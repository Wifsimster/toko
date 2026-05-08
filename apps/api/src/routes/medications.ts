import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, desc, gte, inArray } from "drizzle-orm";
import { db, medications, medicationLogs } from "@focusflow/db";
import {
  createMedicationSchema,
  updateMedicationSchema,
  createMedicationLogSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess } from "../lib/child-access";
import { logAudit } from "../lib/audit";

export const medicationsRoutes = new Hono<AppEnv>();

medicationsRoutes.use("*", authMiddleware);

async function assertMedicationOwnership(userId: string, medicationId: string) {
  const [row] = await db
    .select({ childId: medications.childId })
    .from(medications)
    .where(eq(medications.id, medicationId));
  if (!row) throw new AppError("NOT_FOUND", "Traitement non trouvé", 404);
  await assertChildAccess(userId, row.childId);
  return row;
}

medicationsRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  await assertChildAccess(user.id, childId);

  const result = await db
    .select()
    .from(medications)
    .where(eq(medications.childId, childId))
    .orderBy(desc(medications.active), desc(medications.createdAt));

  return c.json(result);
});

medicationsRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createMedicationSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await assertChildAccess(user.id, parsed.data.childId);

  const [created] = await db
    .insert(medications)
    .values(parsed.data)
    .returning();

  if (created) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: created.childId,
      entityType: "medication",
      entityId: created.id,
      action: "create",
      summary: `Médicament ${created.name} ajouté`,
    });
  }

  return c.json(created, 201);
});

medicationsRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateMedicationSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await assertMedicationOwnership(user.id, id);

  const [updated] = await db
    .update(medications)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(medications.id, id))
    .returning();

  if (updated) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: updated.childId,
      entityType: "medication",
      entityId: updated.id,
      action: "update",
      summary: `Médicament ${updated.name} mis à jour`,
    });
  }

  return c.json(updated);
});

medicationsRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  await assertMedicationOwnership(user.id, id);

  const [existing] = await db
    .select()
    .from(medications)
    .where(eq(medications.id, id));

  await db.delete(medications).where(eq(medications.id, id));

  if (existing) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: existing.childId,
      entityType: "medication",
      entityId: existing.id,
      action: "delete",
      summary: `Médicament ${existing.name} supprimé`,
    });
  }

  return c.json({ ok: true });
});

// Adherence + recent logs for a child, scoped to the last 30 days.
// Returns per-medication counts so the dashboard can show streaks without
// shipping the whole log history.
medicationsRoutes.get("/:childId/adherence", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  await assertChildAccess(user.id, childId);

  const sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

  const activeMeds = await db
    .select()
    .from(medications)
    .where(and(eq(medications.childId, childId), eq(medications.active, true)));

  if (activeMeds.length === 0) {
    return c.json({ medications: [] });
  }

  const medIds = activeMeds.map((m) => m.id);
  const logs = await db
    .select()
    .from(medicationLogs)
    .where(
      and(
        inArray(medicationLogs.medicationId, medIds),
        gte(medicationLogs.date, sinceDate)
      )
    );

  const logsByMed = new Map<string, typeof logs>();
  for (const log of logs) {
    const bucket = logsByMed.get(log.medicationId);
    if (bucket) bucket.push(log);
    else logsByMed.set(log.medicationId, [log]);
  }

  const today = new Date().toISOString().split("T")[0]!;
  const result = activeMeds.map((med) => {
    const medLogs = logsByMed.get(med.id) ?? [];
    const taken = medLogs.filter((l) => l.taken).length;
    const logged = medLogs.length;
    const todayLog = medLogs.find((l) => l.date === today) ?? null;
    return {
      id: med.id,
      name: med.name,
      dose: med.dose,
      schedule: med.schedule,
      adherenceRate: logged === 0 ? null : Math.round((taken / logged) * 100),
      takenCount: taken,
      loggedCount: logged,
      todayTaken: todayLog?.taken ?? null,
    };
  });

  return c.json({ medications: result });
});

medicationsRoutes.post("/logs", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createMedicationLogSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const ownership = await assertMedicationOwnership(
    user.id,
    parsed.data.medicationId,
  );

  // Upsert on (medicationId, date) — parent can flip "taken" after the fact.
  const [log] = await db
    .insert(medicationLogs)
    .values(parsed.data)
    .onConflictDoUpdate({
      target: [medicationLogs.medicationId, medicationLogs.date],
      set: {
        taken: parsed.data.taken,
        sideEffects: parsed.data.sideEffects,
      },
    })
    .returning();

  if (log) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: ownership.childId,
      entityType: "medication_log",
      entityId: log.id,
      action: log.taken ? "create" : "update",
      summary: log.taken
        ? "Prise de médicament enregistrée"
        : "Prise de médicament mise à jour",
    });
  }

  return c.json(log, 201);
});
