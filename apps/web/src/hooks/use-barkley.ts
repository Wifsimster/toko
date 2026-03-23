import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BarkleyStep,
  CreateBarkleyStep,
  BarkleyBehavior,
  CreateBarkleyBehavior,
  UpdateBarkleyBehavior,
  BarkleyBehaviorLog,
  CreateBarkleyBehaviorLog,
} from "@focusflow/validators";

export const barkleyKeys = {
  steps: (childId: string) => ["barkley-steps", childId] as const,
  behaviors: (childId: string) => ["barkley-behaviors", childId] as const,
  logs: (childId: string, week: string) =>
    ["barkley-logs", childId, week] as const,
};

// ─── Steps ────────────────────────────────────────────────

export function useBarkleySteps(childId: string) {
  return useQuery({
    queryKey: barkleyKeys.steps(childId),
    queryFn: () => api.get<BarkleyStep[]>(`/barkley/steps/${childId}`),
    enabled: !!childId,
  });
}

export function useCompleteBarkleyStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBarkleyStep) =>
      api.post<BarkleyStep>("/barkley/steps", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: barkleyKeys.steps(variables.childId),
      }),
  });
}

export function useDeleteBarkleyStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, childId }: { id: string; childId: string }) =>
      api.delete(`/barkley/steps/${id}`),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: barkleyKeys.steps(variables.childId),
      }),
  });
}

// ─── Behaviors ────────────────────────────────────────────

export function useBarkleyBehaviors(childId: string) {
  return useQuery({
    queryKey: barkleyKeys.behaviors(childId),
    queryFn: () =>
      api.get<BarkleyBehavior[]>(`/barkley/behaviors/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateBarkleyBehavior() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBarkleyBehavior) =>
      api.post<BarkleyBehavior>("/barkley/behaviors", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: barkleyKeys.behaviors(variables.childId),
      }),
  });
}

export function useUpdateBarkleyBehavior() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId,
      ...data
    }: UpdateBarkleyBehavior & { id: string; childId: string }) =>
      api.patch<BarkleyBehavior>(`/barkley/behaviors/${id}`, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: barkleyKeys.behaviors(variables.childId),
      }),
  });
}

export function useDeleteBarkleyBehavior() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, childId }: { id: string; childId: string }) =>
      api.delete(`/barkley/behaviors/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: barkleyKeys.behaviors(variables.childId),
      });
      // Also invalidate logs since deleting a behavior removes its logs
      queryClient.invalidateQueries({
        queryKey: ["barkley-logs", variables.childId],
      });
    },
  });
}

// ─── Behavior Logs ────────────────────────────────────────

export function useBarkleyLogs(childId: string, week: string) {
  return useQuery({
    queryKey: barkleyKeys.logs(childId, week),
    queryFn: () =>
      api.get<{ behaviors: BarkleyBehavior[]; logs: BarkleyBehaviorLog[] }>(
        `/barkley/logs/${childId}?week=${week}`
      ),
    enabled: !!childId && !!week,
  });
}

export function useToggleBarkleyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: CreateBarkleyBehaviorLog & { childId: string; week: string }
    ) => api.post<BarkleyBehaviorLog>("/barkley/logs", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: barkleyKeys.logs(variables.childId, variables.week),
      }),
  });
}
