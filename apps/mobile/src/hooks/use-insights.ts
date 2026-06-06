import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";

// Response shape mirrors apps/api/src/routes/stats.ts GET /:childId (standard format)
export type SymptomPoint = {
  date: string;
  mood: number;
  focus: number;
  agitation: number;
  impulse: number;
  sleep: number;
};

export type StatsResponse = {
  consistencyScore: number | null;
  streak: number;
  daysSinceLastEntry: number | null;
  moodTrend: "up" | "down" | "stable" | null;
  weeklyStars: number;
  latestMood: number | null;
  latestJournalEntry: {
    id: string;
    date: string;
    text: string | null;
    tags: string[] | null;
  } | null;
  period: string;
  periodDays: number;
  symptoms: SymptomPoint[];
  weeklySymptoms: SymptomPoint[];
};

// Response shape for GET /:childId/correlations
export type CorrelationInsight = {
  behaviorName: string;
  dimension: string;
  dimensionLabel: string;
  onValue: number;
  offValue: number;
  delta: number;
  sampleOn: number;
  sampleOff: number;
};

export type CorrelationResponse =
  | { insufficientData: true; insight: null; lookbackDays: number }
  | { insufficientData: false; insight: CorrelationInsight; lookbackDays: number };

export function useInsights(
  childId: string,
  period: "week" | "month" | "quarter" = "week",
) {
  return useQuery({
    queryKey: ["insights", childId, period],
    queryFn: () =>
      api.get<StatsResponse>(`/stats/${childId}?period=${period}`),
    enabled: !!childId,
    staleTime: 60_000,
  });
}

export function useCorrelations(childId: string) {
  return useQuery({
    queryKey: ["insights", childId, "correlations"],
    queryFn: () =>
      api.get<CorrelationResponse>(`/stats/${childId}/correlations`),
    enabled: !!childId,
    staleTime: 5 * 60_000,
  });
}
