import type {
  CreateSymptom,
  Symptom,
  UpdateSymptom,
} from "@focusflow/validators";
import type { QueryClient } from "@tanstack/react-query";

import { api } from "./api";
import {
  calmMinutesQueryKey,
  symptomMutationKeys,
  symptomsQueryKey,
} from "./mutation-keys";

type UpdateVars = UpdateSymptom & { id: string; childId: string };

// Mutation defaults live on the QueryClient (not in the hooks) so that an
// offline-paused mutation can be persisted to AsyncStorage and replayed after
// a reconnect *or* an app restart — React Query only resumes a paused mutation
// if its mutationFn is registered as a default for the mutationKey. The hooks
// (use-symptoms.ts) just reference the keys; all behaviour is here.
export function registerMutationDefaults(queryClient: QueryClient) {
  queryClient.setMutationDefaults(symptomMutationKeys.create, {
    mutationFn: (data: CreateSymptom) => api.post<Symptom>("/symptoms", data),
    onMutate: async (variables: CreateSymptom) => {
      const key = symptomsQueryKey(variables.childId);
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
    onError: (_err, variables: CreateSymptom, context) => {
      const ctx = context as { previous?: Symptom[]; key?: readonly unknown[] };
      if (ctx?.previous !== undefined && ctx.key) {
        queryClient.setQueryData(ctx.key, ctx.previous);
      }
    },
    onSettled: (_data, _err, variables: CreateSymptom) => {
      queryClient.invalidateQueries({ queryKey: symptomsQueryKey(variables.childId) });
      queryClient.invalidateQueries({ queryKey: calmMinutesQueryKey(variables.childId) });
    },
  });

  queryClient.setMutationDefaults(symptomMutationKeys.delete, {
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/symptoms/${id}`),
    onMutate: async (variables: { id: string; childId: string }) => {
      const key = symptomsQueryKey(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Symptom[]>(key);
      queryClient.setQueryData<Symptom[]>(key, (old) =>
        old ? old.filter((s) => s.id !== variables.id) : old,
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      const ctx = context as { previous?: Symptom[]; key?: readonly unknown[] };
      if (ctx?.previous !== undefined && ctx.key) {
        queryClient.setQueryData(ctx.key, ctx.previous);
      }
    },
    onSettled: (_data, _err, variables: { id: string; childId: string }) => {
      queryClient.invalidateQueries({ queryKey: symptomsQueryKey(variables.childId) });
      queryClient.invalidateQueries({ queryKey: calmMinutesQueryKey(variables.childId) });
    },
  });

  queryClient.setMutationDefaults(symptomMutationKeys.update, {
    mutationFn: ({ id, childId: _childId, ...data }: UpdateVars) =>
      api.patch<Symptom>(`/symptoms/${id}`, data),
    onMutate: async (variables: UpdateVars) => {
      const key = symptomsQueryKey(variables.childId);
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
    onError: (_err, _variables: UpdateVars, context) => {
      const ctx = context as { previous?: Symptom[]; key?: readonly unknown[] };
      if (ctx?.previous !== undefined && ctx.key) {
        queryClient.setQueryData(ctx.key, ctx.previous);
      }
    },
    onSettled: (_data, _err, variables: UpdateVars) => {
      queryClient.invalidateQueries({ queryKey: symptomsQueryKey(variables.childId) });
      queryClient.invalidateQueries({ queryKey: calmMinutesQueryKey(variables.childId) });
    },
  });
}
