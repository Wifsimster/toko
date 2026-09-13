import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import {
  db,
  children,
  symptoms,
  journalEntries,
  barkleySteps,
  crisisItems,
  medications,
  medicationLogs,
} from "@focusflow/db";
import { AppError } from "../../middleware/error-handler";
import type { ReportData } from "./types";

/**
 * The report's single read model: everything the renderers need, fetched
 * once. Isolating it here means a renderer can be exercised with a literal
 * fixture (see `__tests__/report-render.test.ts`) and the query plan can
 * change without touching a single line of presentation code.
 */

export interface LoadReportDataInput {
  childId: string;
  sinceDate: string;
  untilDate: string;
  questions?: string;
  parentName: string;
}

export async function loadReportData(
  input: LoadReportDataInput,
): Promise<ReportData> {
  const { childId, sinceDate, untilDate, questions, parentName } = input;

  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, childId));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  const [periodSymptoms, periodJournal, steps, crisis, meds] =
    await Promise.all([
      db
        .select()
        .from(symptoms)
        .where(
          and(
            eq(symptoms.childId, childId),
            gte(symptoms.date, sinceDate),
            lte(symptoms.date, untilDate),
          ),
        )
        .orderBy(symptoms.date),
      db
        .select()
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.childId, childId),
            gte(journalEntries.date, sinceDate),
            lte(journalEntries.date, untilDate),
          ),
        )
        .orderBy(journalEntries.date),
      db.select().from(barkleySteps).where(eq(barkleySteps.childId, childId)),
      db
        .select()
        .from(crisisItems)
        .where(eq(crisisItems.childId, childId))
        .orderBy(asc(crisisItems.position)),
      db
        .select()
        .from(medications)
        .where(eq(medications.childId, childId))
        .orderBy(asc(medications.startDate)),
    ]);

  return {
    child,
    sinceDate,
    untilDate,
    symptoms: periodSymptoms,
    journal: periodJournal,
    barkleySteps: steps,
    crisisItems: crisis,
    medications: await withAdherence(meds, sinceDate, untilDate),
    questions,
    parentName,
  };
}

/**
 * Adherence per medication over the period (taken vs scheduled days), so
 * the doctor sees observance at a glance without sifting through logs.
 */
async function withAdherence(
  meds: Array<typeof medications.$inferSelect>,
  sinceDate: string,
  untilDate: string,
): Promise<ReportData["medications"]> {
  const medIds = meds.map((m) => m.id);
  const logsByMed = new Map<string, { taken: number; total: number }>();

  if (medIds.length > 0) {
    const logs = await db
      .select()
      .from(medicationLogs)
      .where(
        and(
          inArray(medicationLogs.medicationId, medIds),
          gte(medicationLogs.date, sinceDate),
          lte(medicationLogs.date, untilDate),
        ),
      );
    for (const log of logs) {
      const cur = logsByMed.get(log.medicationId) ?? { taken: 0, total: 0 };
      cur.total += 1;
      if (log.taken) cur.taken += 1;
      logsByMed.set(log.medicationId, cur);
    }
  }

  return meds.map((m) => ({
    name: m.name,
    dose: m.dose,
    schedule: m.schedule,
    startDate: m.startDate,
    endDate: m.endDate,
    notes: m.notes,
    active: m.active,
    adherence: logsByMed.get(m.id) ?? null,
  }));
}
