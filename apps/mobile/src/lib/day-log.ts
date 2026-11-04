import {
  SYMPTOM_PRESET_CALM,
  SYMPTOM_PRESET_TOUGH,
  dayLevelOf,
  symptomValuesOf,
  type DayLevel,
  type Symptom,
  type SymptomValues,
} from "@focusflow/validators";

import { todayISO } from "./date";

export type DayChoice = "calm" | "typical" | "tough";

export const DAY_CHOICES: readonly DayChoice[] = ["calm", "typical", "tough"];

export const DAY_LEVEL_WORD: Record<DayLevel, string> = {
  good: "journée calme",
  ok: "journée typique",
  hard: "journée difficile",
};

const WEEKDAYS_FROM_MONDAY = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

function stamp(s: Symptom): string {
  return s.updatedAt;
}

function newer(a: Symptom, b: Symptom): Symptom {
  const byDate = a.date.localeCompare(b.date);
  if (byDate !== 0) return byDate > 0 ? a : b;
  return stamp(a) >= stamp(b) ? a : b;
}

export function latestSymptom(entries: readonly Symptom[] | undefined): Symptom | null {
  if (!entries || entries.length === 0) return null;
  return entries.reduce(newer);
}

export function symptomOn(entries: readonly Symptom[] | undefined, iso: string): Symptom | null {
  return latestSymptom((entries ?? []).filter((s) => s.date === iso));
}

export function valuesForChoice(
  choice: DayChoice,
  entries: readonly Symptom[] | undefined,
): SymptomValues {
  if (choice === "calm") return SYMPTOM_PRESET_CALM;
  if (choice === "tough") return SYMPTOM_PRESET_TOUGH;
  return symptomValuesOf(latestSymptom(entries));
}

export type WeekPill = {
  iso: string;
  weekday: string;
  initial: string;
  level: DayLevel | null;
  isToday: boolean;
  isFuture: boolean;
  accessibilityLabel: string;
};

export function weekPills(
  entries: readonly Symptom[] | undefined,
  now: Date = new Date(),
): WeekPill[] {
  const today = todayISO(now);
  const offset = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
  return WEEKDAYS_FROM_MONDAY.map((weekday, i) => {
    const day = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const iso = todayISO(day);
    const entry = symptomOn(entries, iso);
    const level = entry ? dayLevelOf(entry) : null;
    const isFuture = iso > today;
    const status = level ? DAY_LEVEL_WORD[level] : isFuture ? "à venir" : "pas de relevé";
    return {
      iso,
      weekday,
      initial: weekday.charAt(0),
      level,
      isToday: iso === today,
      isFuture,
      accessibilityLabel: `${weekday} : ${status}`,
    };
  });
}
