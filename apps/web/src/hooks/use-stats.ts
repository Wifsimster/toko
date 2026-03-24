import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Stats {
  streak: number;
  latestMoodRating: number | null;
  weeklySymptoms: {
    date: string;
    mood: number;
    focus: number;
    agitation: number;
    impulse: number;
    sleep: number;
    social: number;
    autonomy: number;
  }[];
}

export const statsKeys = {
  child: (childId: string) => ["stats", childId] as const,
};

export function useStats(childId: string) {
  return useQuery({
    queryKey: statsKeys.child(childId),
    queryFn: () => api.get<Stats>(`/stats/${childId}`),
    enabled: !!childId,
    refetchInterval: 60_000,
  });
}
