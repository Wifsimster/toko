import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { api } from "@/lib/api-client";
import type {
  Routine,
  RoutineCompletion,
  CreateRoutine,
  UpdateRoutine,
  UpsertRoutineSteps,
  CompleteRoutineStep,
} from "@focusflow/validators";

export const routinesKeys = {
  all: (childId: string) => ["routines", childId] as const,
  completions: (childId: string, date: string) =>
    ["routines", childId, "completions", date] as const,
};

export function useRoutines(childId: string) {
  return useQuery({
    queryKey: routinesKeys.all(childId),
    queryFn: () => api.get<Routine[]>(`/routines/${childId}`),
    enabled: !!childId,
  });
}

export function useRoutineCompletions(childId: string, date: string) {
  return useQuery({
    queryKey: routinesKeys.completions(childId, date),
    queryFn: () =>
      api.get<RoutineCompletion[]>(
        `/routines/${childId}/completions?date=${date}`,
      ),
    enabled: !!childId && !!date,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoutine) => api.post<Routine>("/routines", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: routinesKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.addRoutine")),
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: UpdateRoutine & { id: string; childId: string }) =>
      api.patch<Routine>(`/routines/${id}`, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: routinesKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.editRoutine")),
  });
}

export function useUpsertRoutineSteps() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      steps,
    }: UpsertRoutineSteps & { id: string; childId: string }) =>
      api.patch<Routine>(`/routines/${id}/steps`, { steps }),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: routinesKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.editRoutine")),
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/routines/${id}`),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: routinesKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.deleteRoutine")),
  });
}

export function useCompleteStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      routineId,
      stepId,
      date,
    }: CompleteRoutineStep & { routineId: string; childId: string }) =>
      api.post<RoutineCompletion>(`/routines/${routineId}/complete`, {
        stepId,
        date,
      }),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: routinesKeys.completions(variables.childId, variables.date),
      }),
  });
}

export function useUncompleteStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      routineId,
      stepId,
      date,
    }: CompleteRoutineStep & { routineId: string; childId: string }) =>
      api.post<{ ok: true }>(`/routines/${routineId}/uncomplete`, {
        stepId,
        date,
      }),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: routinesKeys.completions(variables.childId, variables.date),
      }),
  });
}
