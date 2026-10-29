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

export function dimensionValues(
  symptoms: ReportData["symptoms"],
  key: SymptomDimension,
): number[] {
  return symptoms
    .map((s) => s[key])
    .filter((v) => typeof v === "number" && Number.isFinite(v));
}

export function avg(values: number[]): string {
  if (values.length === 0) return "—";
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
}

export function countTrackedDays(symptoms: ReportData["symptoms"]): number {
  return new Set(symptoms.map((s) => s.date)).size;
}

export function countCrisisEntries(journal: ReportData["journal"]): number {
  return journal.filter(
    (e) => Array.isArray(e.tags) && (e.tags as string[]).includes("crisis"),
  ).length;
}
