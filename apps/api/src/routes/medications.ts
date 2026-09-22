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
import { assertChildAccess, childIsShared } from "../lib/child-access";
import { logAudit, getCreatorNames } from "../lib/audit";
import { parseBody } from "../lib/http/validate";
import {
  getUserTimezone,
  localISODateDaysAgo,
  toLocalISODate,
} from "../lib/local-date";

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

  // Creator attribution is only meaningful — and only shown — when the
  // child is co-managed. Skip the audit lookup entirely for a solo parent.
  const creators = (await childIsShared(childId))
    ? await getCreatorNames(childId, "medication")
    : null;

  return c.json(
    result.map((m) => ({ ...m, createdByName: creators?.get(m.id) ?? null })),
  );
});

medicationsRoutes.post("/", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, createMedicationSchema);

  await assertChildAccess(user.id, input.childId);

  const [created] = await db
    .insert(medications)
    .values(input)
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
  const input = await parseBody(c, updateMedicationSchema);

  await assertMedicationOwnership(user.id, id);

  const [updated] = await db
    .update(medications)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(medications.id, id))
    .returning();

  // The row can vanish between the ownership check and the update.
  if (!updated) {
    throw new AppError("NOT_FOUND", "Traitement non trouvé", 404);
  }

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: updated.childId,
    entityType: "medication",
    entityId: updated.id,
    action: "update",
    summary: `Médicament ${updated.name} mis à jour`,
  });

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

  const tz = await getUserTimezone(user.id);
  // Today plus the 29 previous days = exactly 30 calendar days.
  const sinceDate = localISODateDaysAgo(tz, 30 - 1);

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

  const today = toLocalISODate(tz);
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
  const input = await parseBody(c, createMedicationLogSchema);

  const ownership = await assertMedicationOwnership(
    user.id,
    input.medicationId,
  );

  // Upsert on (medicationId, date) — parent can flip "taken" after the fact.
  const [log] = await db
    .insert(medicationLogs)
    .values(input)
    .onConflictDoUpdate({
      target: [medicationLogs.medicationId, medicationLogs.date],
      set: {
        taken: input.taken,
        sideEffects: input.sideEffects,
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
