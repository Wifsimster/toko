export interface SymptomPoint {
  date: string;
  mood: number;
  focus: number;
  agitation: number;
  impulse: number;
  sleep: number;
}

export type MoodTrend = "up" | "down" | "stable";

const TREND_MIN_POINTS = 4;
const TREND_MIN_DELTA = 0.5;

export function currentStreak(
  datesWithEntry: Iterable<string>,
  today: string,
  maxDays = 365,
): number {
  const dates = new Set(datesWithEntry);
  const anchor = new Date(`${today}T00:00:00Z`);
  let streak = 0;
  for (let i = 0; i < maxDays; i++) {
    const day = new Date(anchor);
    day.setUTCDate(day.getUTCDate() - i);
    if (!dates.has(day.toISOString().slice(0, 10))) break;
    streak++;
  }
  return streak;
}

export function daysSinceLastEntry(
  lastEntryDate: string | null | undefined,
  today: string,
): number | null {
  if (!lastEntryDate) return null;
  const last = new Date(`${lastEntryDate}T00:00:00Z`).getTime();
  const now = new Date(`${today}T00:00:00Z`).getTime();
  return Math.floor((now - last) / 86_400_000);
}

export function moodTrend(symptoms: SymptomPoint[]): MoodTrend | null {
  if (symptoms.length < TREND_MIN_POINTS) return null;
  const half = Math.floor(symptoms.length / 2);
  const firstHalfAvg =
    symptoms.slice(0, half).reduce((s, x) => s + x.mood, 0) / half;
  const secondHalfAvg =
    symptoms.slice(half).reduce((s, x) => s + x.mood, 0) /
    (symptoms.length - half);
  const delta = secondHalfAvg - firstHalfAvg;
  if (delta > TREND_MIN_DELTA) return "up";
  if (delta < -TREND_MIN_DELTA) return "down";
  return "stable";
}

export function consistencyScore(
  symptoms: SymptomPoint[],
  periodDays: number,
): number | null {
  if (symptoms.length === 0) return null;
  const coverage = Math.min(
    1,
    new Set(symptoms.map((s) => s.date)).size / periodDays,
  );
  const okDays = symptoms.filter(
    (s) => s.focus >= 6 || s.mood >= 6 || s.agitation <= 4 || s.impulse <= 4,
  ).length;
  return Math.round(coverage * (okDays / symptoms.length) * 100);
}

export function topJournalTags(
  entries: Array<{ tags: unknown }>,
  limit = 3,
): string[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (!Array.isArray(entry.tags)) continue;
    for (const tag of entry.tags as string[]) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function bestAndHardestDay(symptoms: SymptomPoint[]): {
  bestDay: string | null;
  hardestDay: string | null;
} {
  if (symptoms.length === 0) return { bestDay: null, hardestDay: null };

  const byDate = new Map<string, { sum: number; count: number }>();
  for (const s of symptoms) {
    const score = s.mood + s.focus - s.agitation - s.impulse;
    const entry = byDate.get(s.date) ?? { sum: 0, count: 0 };
    entry.sum += score;
    entry.count++;
    byDate.set(s.date, entry);
  }

  let bestDay: string | null = null;
  let hardestDay: string | null = null;
  let bestAvg = -Infinity;
  let hardestAvg = Infinity;
  for (const [date, { sum, count }] of byDate) {
    const avg = sum / count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = date;
    }
    if (avg < hardestAvg) {
      hardestAvg = avg;
      hardestDay = date;
    }
  }

  return { bestDay, hardestDay: bestDay === hardestDay ? null : hardestDay };
}
