import type {
  BarkleyBehavior,
  BarkleyBehaviorLog,
  CreateBarkleyBehaviorLog,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Query keys — namespaced to avoid collisions with other features.
const keys = {
  behaviors: (childId: string) => ["barkley-behaviors", childId] as const,
  logs: (childId: string) => ["barkley-logs", childId] as const,
  stars: (childId: string) => ["barkley-stars", childId] as const,
};

/** List of configured behaviors (token board) for a child. */
export function useBarkleyBehaviors(childId: string) {
  return useQuery({
    queryKey: keys.behaviors(childId),
    queryFn: () => api.get<BarkleyBehavior[]>(`/barkley/behaviors/${childId}`),
    enabled: !!childId,
  });
}

/** Today's logs + behaviors — uses the /logs endpoint with no week param so
 *  the server defaults to the current week. */
export function useBarkleyTodayLogs(childId: string) {
  return useQuery({
    queryKey: keys.logs(childId),
    queryFn: () =>
      api.get<{ behaviors: BarkleyBehavior[]; logs: BarkleyBehaviorLog[] }>(
        `/barkley/logs/${childId}`,
      ),
    enabled: !!childId,
  });
}

export type BarkleyStarCount = {
  totalStars: number;
  spentStars: number;
  availableStars: number;
  weeklyStars: number;
};

/** Cumulative star / points balance for a child. */
export function useBarkleyStars(childId: string) {
  return useQuery({
    queryKey: keys.stars(childId),
    queryFn: () => api.get<BarkleyStarCount>(`/barkley/stars/${childId}`),
    enabled: !!childId,
  });
}

/** Log (or toggle) a behavior occurrence for a given date.
 *  The caller passes childId so we can invalidate the right query keys. */
export function useLogBarkleyBehavior(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBarkleyBehaviorLog) =>
      api.post<BarkleyBehaviorLog>("/barkley/logs", data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.logs(childId) });
      qc.invalidateQueries({ queryKey: keys.stars(childId) });
    },
  });
}
