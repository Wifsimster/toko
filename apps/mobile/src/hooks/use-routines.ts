import type { Routine, RoutineCompletion } from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-routines.ts for the "execute the routine" use
// case: list routines, list today's completions, toggle a step done/undone.
// Authoring routines stays on the web.
const routinesKey = (childId: string) => ["routines", childId] as const;
const completionsKey = (childId: string, date: string) =>
  ["routines", childId, "completions", date] as const;

type ToggleVars = {
  childId: string;
  routineId: string;
  stepId: string;
  date: string;
};

export function useRoutines(childId: string) {
  return useQuery({
    queryKey: routinesKey(childId),
    queryFn: () => api.get<Routine[]>(`/routines/${childId}`),
    enabled: !!childId,
  });
}

export function useRoutineCompletions(childId: string, date: string) {
  return useQuery({
    queryKey: completionsKey(childId, date),
    queryFn: () =>
      api.get<RoutineCompletion[]>(`/routines/${childId}/completions?date=${date}`),
    enabled: !!childId,
  });
}

export function useCompleteStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routineId, stepId, date }: ToggleVars) =>
      api.post<RoutineCompletion>(`/routines/${routineId}/complete`, {
        stepId,
        date,
      }),
    onMutate: async (variables) => {
      const key = completionsKey(variables.childId, variables.date);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RoutineCompletion[]>(key);
      const optimistic: RoutineCompletion = {
        id: `optimistic-${variables.stepId}`,
        routineId: variables.routineId,
        stepId: variables.stepId,
        childId: variables.childId,
        date: variables.date,
        completedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<RoutineCompletion[]>(key, (old) =>
        old ? [...old, optimistic] : [optimistic],
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: completionsKey(variables.childId, variables.date),
      });
    },
  });
}

export function useUncompleteStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routineId, stepId, date }: ToggleVars) =>
      api.post<{ ok: true }>(`/routines/${routineId}/uncomplete`, {
        stepId,
        date,
      }),
    onMutate: async (variables) => {
      const key = completionsKey(variables.childId, variables.date);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RoutineCompletion[]>(key);
      queryClient.setQueryData<RoutineCompletion[]>(key, (old) =>
        old ? old.filter((c) => c.stepId !== variables.stepId) : old,
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: completionsKey(variables.childId, variables.date),
      });
    },
  });
}
