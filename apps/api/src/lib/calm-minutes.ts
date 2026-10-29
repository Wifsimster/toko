export type SymptomMinutes = {
  routinesOk: boolean;
  agitation: number;
  mood: number;
  focus: number;
  impulse: number;
};

export const CALM_MINUTES_DAILY_CAP = 40;

export function calmMinutesForDay(s: SymptomMinutes): number {
  let minutes = 0;
  if (s.routinesOk) minutes += 15;
  if (s.agitation <= 3) minutes += 10;
  if (s.mood >= 7) minutes += 5;
  if (s.focus >= 7) minutes += 5;
  if (s.impulse <= 3) minutes += 5;
  return Math.min(minutes, CALM_MINUTES_DAILY_CAP);
}

export type DailyCalmMinutes = { date: string; minutes: number };

export function aggregateDailyCalmMinutes(
  entries: Array<{ date: string } & SymptomMinutes>
): DailyCalmMinutes[] {
  const byDate = new Map<string, number>();
  for (const e of entries) {
    const score = calmMinutesForDay(e);
    const prev = byDate.get(e.date);
    if (prev === undefined || score > prev) byDate.set(e.date, score);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, minutes]) => ({ date, minutes }));
}
