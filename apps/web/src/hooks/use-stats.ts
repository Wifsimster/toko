import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type StatsPeriod = "week" | "month" | "quarter" | "custom";

export interface CustomDateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export interface SymptomPoint {
  date: string;
  mood: number;
  focus: number;
  agitation: number;
  impulse: number;
  sleep: number;
}

export interface LatestJournalEntry {
  id: string;
  date: string;
  text: string;
  tags: string[];
}

interface Stats {
  consistencyScore: number | null;
  streak: number;
  daysSinceLastEntry: number | null;
  moodTrend: "up" | "down" | "stable" | null;
  weeklyStars: number;
  latestMood: number | null;
  latestJournalEntry: LatestJournalEntry | null;
  period: StatsPeriod;
  periodDays: number;
  symptoms: SymptomPoint[];
  /** @deprecated use `symptoms` instead */
  weeklySymptoms: SymptomPoint[];
}

export const statsKeys = {
  child: (childId: string, period?: StatsPeriod, range?: CustomDateRange) =>
    range
      ? (["stats", childId, "custom", range.from, range.to] as const)
      : period
        ? (["stats", childId, period] as const)
        : (["stats", childId] as const),
};

export function useStats(childId: string, period: StatsPeriod = "week", range?: CustomDateRange) {
  const queryParam =
    period === "custom" && range
      ? `from=${range.from}&to=${range.to}`
      : `period=${period}`;
  return useQuery({
    queryKey: statsKeys.child(childId, period, range),
    queryFn: () => api.get<Stats>(`/stats/${childId}?${queryParam}`),
    enabled: !!childId,
    refetchInterval: 60_000,
  });
}

export interface CorrelationInsight {
  behaviorName: string;
  dimension: string;
  dimensionLabel: string;
  onValue: number;
  offValue: number;
  delta: number;
  sampleOn: number;
  sampleOff: number;
}

export interface CorrelationResponse {
  insufficientData: boolean;
  insight: CorrelationInsight | null;
  lookbackDays?: number;
}

export function useCorrelations(childId: string) {
  return useQuery({
    queryKey: ["correlations", childId] as const,
    queryFn: () =>
      api.get<CorrelationResponse>(`/stats/${childId}/correlations`),
    enabled: !!childId,
    staleTime: 5 * 60_000,
  });
}
