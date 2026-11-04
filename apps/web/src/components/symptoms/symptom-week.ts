import { dayLevelOf, type DayLevel, type Symptom } from "@focusflow/validators";
import { parseISODate, toISODate } from "@/lib/date";

export type SymptomWeekDay = { date: string; level: DayLevel | null };

export function mondayWeekOf(todayIso: string): string[] {
  const today = parseISODate(todayIso);
  const fromMonday = (today.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - fromMonday + i);
    return toISODate(d);
  });
}

export function symptomWeek(entries: readonly Symptom[], todayIso: string): SymptomWeekDay[] {
  const byDate = new Map(entries.map((e) => [e.date, e]));
  return mondayWeekOf(todayIso).map((date) => {
    const entry = byDate.get(date);
    return { date, level: entry ? dayLevelOf(entry) : null };
  });
}
