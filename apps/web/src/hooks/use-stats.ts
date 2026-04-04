import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type StatsPeriod = "week" | "month" | "quarter";

export interface SymptomPoint {
  date: string;
  mood: number;
  focus: number;
  agitation: number;
  impulse: number;
  sleep: number;
  social: number;
  autonomy: number;
}

export interface LatestJournalEntry {
  id: string;
  date: string;
  text: string;
  moodRating: number;
  tags: string[];
}

interface Stats {
  streak: number;
  daysSinceLastEntry: number | null;
  moodTrend: "up" | "down" | "stable" | null;
  weeklyStars: number;
  latestMoodRating: number | null;
  latestJournalEntry: LatestJournalEntry | null;
  period: StatsPeriod;
  periodDays: number;
  symptoms: SymptomPoint[];
  /** @deprecated use `symptoms` instead */
  weeklySymptoms: SymptomPoint[];
}

export const statsKeys = {
  child: (childId: string, period?: StatsPeriod) =>
    period ? (["stats", childId, period] as const) : (["stats", childId] as const),
};

export function useStats(childId: string, period: StatsPeriod = "week") {
  return useQuery({
    queryKey: statsKeys.child(childId, period),
    queryFn: () => api.get<Stats>(`/stats/${childId}?period=${period}`),
    enabled: !!childId,
    refetchInterval: 60_000,
  });
}
