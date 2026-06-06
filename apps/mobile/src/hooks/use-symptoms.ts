import type {
  CreateSymptom,
  Symptom,
  UpdateSymptom,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-symptoms.ts: same query keys, optimistic
// updates and invalidation (symptoms list + stats for the calm-minutes KPI),
// so the mobile evening check-in behaves exactly like the web one.
const symptomsKey = (childId: string) => ["symptoms", childId] as const;

export function useSymptoms(childId: string) {
  return useQuery({
    queryKey: symptomsKey(childId),
    queryFn: () => api.get<Symptom[]>(`/symptoms/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSymptom) => api.post<Symptom>("/symptoms", data),
    onMutate: async (variables) => {
      const key = symptomsKey(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Symptom[]>(key);
      const now = new Date().toISOString();
      const optimistic: Symptom = {
        ...variables,
        routinesOk: variables.routinesOk ?? true,
        id: `optimistic-${now}`,
        createdAt: now,
        updatedAt: now,
      };
      queryClient.setQueryData<Symptom[]>(key, (old) =>
        old ? [optimistic, ...old] : [optimistic],
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: symptomsKey(variables.childId) });
      queryClient.invalidateQueries({ queryKey: ["stats", variables.childId] });
    },
  });
}

export function useUpdateSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId: _childId,
      ...data
    }: UpdateSymptom & { id: string; childId: string }) =>
      api.patch<Symptom>(`/symptoms/${id}`, data),
    onMutate: async (variables) => {
      const key = symptomsKey(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Symptom[]>(key);
      queryClient.setQueryData<Symptom[]>(key, (old) =>
        old
          ? old.map((s) =>
              s.id === variables.id
                ? { ...s, ...variables, updatedAt: new Date().toISOString() }
                : s,
            )
          : old,
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: symptomsKey(variables.childId) });
      queryClient.invalidateQueries({ queryKey: ["stats", variables.childId] });
    },
  });
}
