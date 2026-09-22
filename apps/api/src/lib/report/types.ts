/**
 * The medical report's data shape and the vocabulary shared by its
 * renderers. Kept apart from both the loader and the renderers so a new
 * output format (HTML, PDF, CSV…) depends on the shape alone, never on
 * how it was fetched.
 */

export const SYMPTOM_DIMENSIONS = [
  "mood",
  "focus",
  "agitation",
  "impulse",
  "sleep",
] as const;

export type SymptomDimension = (typeof SYMPTOM_DIMENSIONS)[number];

export const SYMPTOM_LABELS: Record<SymptomDimension, string> = {
  mood: "Humeur",
  focus: "Concentration",
  agitation: "Agitation",
  impulse: "Impulsivité",
  sleep: "Sommeil",
};

export const SCHEDULE_LABELS: Record<string, string> = {
  morning: "Matin",
  noon: "Midi",
  evening: "Soir",
  bedtime: "Coucher",
  custom: "Personnalisé",
};

export interface ReportData {
  child: { name: string; gender: string | null; ageRange: string | null };
  sinceDate: string;
  untilDate: string;
  symptoms: Array<{
    date: string;
    mood: number;
    focus: number;
    agitation: number;
    impulse: number;
    sleep: number;
  }>;
  journal: Array<{ date: string; text: string | null; tags: unknown }>;
  barkleySteps: Array<{ stepNumber: number; completedAt: Date | null }>;
  crisisItems: Array<{ label: string; emoji: string | null; position: number }>;
  medications: Array<{
    name: string;
    dose: string | null;
    schedule: "morning" | "noon" | "evening" | "bedtime" | "custom";
    startDate: string;
    endDate: string | null;
    notes: string | null;
    active: boolean;
    adherence: { taken: number; total: number } | null;
  }>;
  questions?: string;
  parentName: string;
}

export type ReportMedication = ReportData["medications"][number];

/** Ratings recorded for one dimension. 0 is a real rating (worst possible
 * day), not an "unset" marker, so only non-finite values are dropped. */
export function dimensionValues(
  symptoms: ReportData["symptoms"],
  key: SymptomDimension,
): number[] {
  return symptoms
    .map((s) => s[key])
    .filter((v) => typeof v === "number" && Number.isFinite(v));
}

/** One-decimal mean, or an em dash when nothing was recorded. */
export function avg(values: number[]): string {
  if (values.length === 0) return "—";
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
}

/** Distinct calendar days with at least one symptom entry. Several entries
 * per day are allowed, so `symptoms.length` would overcount "Jours suivis". */
export function countTrackedDays(symptoms: ReportData["symptoms"]): number {
  return new Set(symptoms.map((s) => s.date)).size;
}

/** Journal entries the parent tagged as a crisis. */
export function countCrisisEntries(journal: ReportData["journal"]): number {
  return journal.filter(
    (e) => Array.isArray(e.tags) && (e.tags as string[]).includes("crisis"),
  ).length;
}
