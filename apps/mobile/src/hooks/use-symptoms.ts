import type {
  CreateSymptom,
  Symptom,
  UpdateSymptom,
} from "@focusflow/validators";
import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";
import { symptomMutationKeys, symptomsQueryKey } from "../lib/mutation-keys";

// The mutation behaviour (optimistic update, invalidation, offline replay)
// lives in the persisted mutation defaults (src/lib/mutations.ts); these hooks
// only reference the keys so a queued mutation resumes even after a restart.

export function useSymptoms(childId: string) {
  return useQuery({
    queryKey: symptomsQueryKey(childId),
    queryFn: () => api.get<Symptom[]>(`/symptoms/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateSymptom() {
  return useMutation<Symptom, Error, CreateSymptom>({
    mutationKey: symptomMutationKeys.create,
  });
}

export function useUpdateSymptom() {
  return useMutation<Symptom, Error, UpdateSymptom & { id: string; childId: string }>({
    mutationKey: symptomMutationKeys.update,
  });
}
