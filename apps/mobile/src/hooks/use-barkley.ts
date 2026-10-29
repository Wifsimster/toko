import type {
  BarkleyBehavior,
  BarkleyBehaviorLog,
  BarkleyStep,
  CreateBarkleyBehaviorLog,
  CreateBarkleyStep,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

const keys = {
  behaviors: (childId: string) => ["barkley-behaviors", childId] as const,
  logs: (childId: string) => ["barkley-logs", childId] as const,
  stars: (childId: string) => ["barkley-stars", childId] as const,
  steps: (childId: string) => ["barkley-steps", childId] as const,
};

export function useBarkleySteps(childId: string) {
  return useQuery({
    queryKey: keys.steps(childId),
    queryFn: () => api.get<BarkleyStep[]>(`/barkley/steps/${childId}`),
    enabled: !!childId,
  });
}

export function useCompleteBarkleyStep(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBarkleyStep) =>
      api.post<BarkleyStep>("/barkley/steps", data),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.steps(childId) }),
  });
}

export function useUncompleteBarkleyStep(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: true }>(`/barkley/steps/${id}`),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.steps(childId) }),
  });
}

export function useBarkleyBehaviors(childId: string) {
  return useQuery({
    queryKey: keys.behaviors(childId),
    queryFn: () => api.get<BarkleyBehavior[]>(`/barkley/behaviors/${childId}`),
    enabled: !!childId,
  });
}

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

export function useBarkleyStars(childId: string) {
  return useQuery({
    queryKey: keys.stars(childId),
    queryFn: () => api.get<BarkleyStarCount>(`/barkley/stars/${childId}`),
    enabled: !!childId,
  });
}

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
