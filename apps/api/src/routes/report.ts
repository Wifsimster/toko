import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  db,
  children,
  symptoms,
  medication,
  medicationLogs,
  journalEntries,
} from "@focusflow/db";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const reportRoutes = new Hono<AppEnv>();

reportRoutes.use("*", authMiddleware);

/**
 * Generate a plain-text medical consultation report.
 * GET /api/report/:childId?from=2024-01-01&to=2024-01-31
 *
 * Returns a structured text report suitable for printing or
 * copy-pasting into a medical consultation document.
 * A future iteration can wrap this in a PDF renderer.
 */
reportRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");
  const from = c.req.query("from");
  const to = c.req.query("to");

  if (!from || !to) {
    return c.json(
      { error: "Paramètres 'from' et 'to' requis (YYYY-MM-DD)" },
      400
    );
  }

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  // Fetch all data for the period
  const [periodSymptoms, meds, logs, journal] = await Promise.all([
    db
      .select()
      .from(symptoms)
      .where(
        and(
          eq(symptoms.childId, childId),
          gte(symptoms.date, from),
          lte(symptoms.date, to)
        )
      ),
    db
      .select()
      .from(medication)
      .where(eq(medication.childId, childId)),
    db
      .select()
      .from(medicationLogs)
      .where(
        and(gte(medicationLogs.date, from), lte(medicationLogs.date, to))
      ),
    db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.childId, childId),
          gte(journalEntries.date, from),
          lte(journalEntries.date, to)
        )
      ),
  ]);

  // Filter logs to only those for this child's medications
  const medIds = new Set(meds.map((m) => m.id));
  const childLogs = logs.filter((l) => medIds.has(l.medicationId));

  // Compute averages
  const avgSymptoms =
    periodSymptoms.length > 0
      ? {
          agitation: avg(periodSymptoms.map((s) => s.agitation)),
          focus: avg(periodSymptoms.map((s) => s.focus)),
          impulse: avg(periodSymptoms.map((s) => s.impulse)),
          mood: avg(periodSymptoms.map((s) => s.mood)),
          sleep: avg(periodSymptoms.map((s) => s.sleep)),
          social: avg(periodSymptoms.map((s) => s.social)),
          autonomy: avg(periodSymptoms.map((s) => s.autonomy)),
        }
      : null;

  // Medication adherence
  const totalDoses = childLogs.length;
  const takenDoses = childLogs.filter((l) => l.status === "taken").length;
  const adherenceRate =
    totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : null;

  // Build report
  const diagnosisLabel = {
    inattentive: "Prédominance inattentive",
    hyperactive: "Prédominance hyperactive-impulsive",
    mixed: "Présentation combinée",
    undefined: "Non défini",
  }[child.diagnosisType] ?? child.diagnosisType;

  const report = {
    title: `Rapport de suivi TDAH — ${child.name}`,
    period: { from, to },
    child: {
      name: child.name,
      birthDate: child.birthDate,
      diagnosisType: diagnosisLabel,
    },
    symptoms: {
      entryCount: periodSymptoms.length,
      averages: avgSymptoms,
      entries: periodSymptoms.map((s) => ({
        date: s.date,
        agitation: s.agitation,
        focus: s.focus,
        impulse: s.impulse,
        mood: s.mood,
        sleep: s.sleep,
        social: s.social,
        autonomy: s.autonomy,
        context: s.context,
        notes: s.notes,
      })),
    },
    medications: {
      active: meds
        .filter((m) => m.active)
        .map((m) => ({
          name: m.name,
          dose: m.dose,
          scheduledAt: m.scheduledAt,
        })),
      adherenceRate,
      totalDoses,
      takenDoses,
      logs: childLogs.map((l) => ({
        date: l.date,
        status: l.status,
        medicationName:
          meds.find((m) => m.id === l.medicationId)?.name ?? "Inconnu",
      })),
    },
    journal: {
      entryCount: journal.length,
      entries: journal.map((j) => ({
        date: j.date,
        moodRating: j.moodRating,
        tags: j.tags,
        text: j.text,
      })),
    },
    generatedAt: new Date().toISOString(),
  };

  return c.json(report);
});

function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.round((numbers.reduce((a, b) => a + b, 0) / numbers.length) * 10) / 10;
}
