import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";
import { calmMinutesQueryKey } from "../lib/mutation-keys";

// Mirrors apps/web/src/hooks/use-stats.ts. Calm minutes (business rule H1) are
// computed server-side, so there is no shared Zod schema — the response shape
// is declared locally.
export type CalmMinutes = {
  period: "week" | "month" | "quarter";
  periodDays: number;
  dailyCapMinutes: number;
  totalMinutes: number;
  averagePerDay: number;
  daysWithEntry: number;
  daily: Array<{ date: string; minutes: number }>;
};

export function useCalmMinutes(
  childId: string,
  period: "week" | "month" | "quarter" = "week",
) {
  return useQuery({
    queryKey: [...calmMinutesQueryKey(childId), period],
    queryFn: () =>
      api.get<CalmMinutes>(`/stats/${childId}/calm-minutes?period=${period}`),
    enabled: !!childId,
    staleTime: 60_000,
  });
}
