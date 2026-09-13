import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  Symptom,
  CreateSymptom,
  UpdateSymptom,
} from "@focusflow/validators";
import { statsKeys } from "@/hooks/use-stats";
import {
  optimisticId,
  patchItem,
  prependItem,
  removeItem,
  useOptimisticListMutation,
} from "@/lib/query/optimistic-list";
import { symptomKeys } from "./symptom-keys";

// Symptom ratings feed the charts, so every write also refreshes stats.
const invalidateStats = ({ childId }: { childId: string }) => [
  statsKeys.child(childId),
];

export function useSymptoms(childId: string) {
  return useQuery({
    queryKey: symptomKeys.all(childId),
    queryFn: () => api.get<Symptom[]>(`/symptoms/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateSymptom() {
  return useOptimisticListMutation<Symptom, CreateSymptom, Symptom>({
    queryKey: ({ childId }) => symptomKeys.all(childId),
    mutationFn: (data) => api.post<Symptom>("/symptoms", data),
    apply: (current, variables) => {
      const now = new Date().toISOString();
      return prependItem(current, {
        ...variables,
        routinesOk: variables.routinesOk ?? true,
        id: optimisticId(),
        createdAt: now,
        updatedAt: now,
      });
    },
    errorMessageKey: "toastErrors.saveSymptom",
    alsoInvalidate: invalidateStats,
  });
}

export function useUpdateSymptom() {
  return useOptimisticListMutation<
    Symptom,
    UpdateSymptom & { id: string; childId: string },
    Symptom
  >({
    queryKey: ({ childId }) => symptomKeys.all(childId),
    mutationFn: ({ id, childId: _childId, ...data }) =>
      api.patch<Symptom>(`/symptoms/${id}`, data),
    apply: (current, variables) =>
      patchItem(current, variables.id, {
        ...variables,
        updatedAt: new Date().toISOString(),
      }),
    errorMessageKey: "toastErrors.editSymptom",
    alsoInvalidate: invalidateStats,
  });
}

export function useDeleteSymptom() {
  return useOptimisticListMutation<
    Symptom,
    { id: string; childId: string },
    { ok: true }
  >({
    queryKey: ({ childId }) => symptomKeys.all(childId),
    mutationFn: ({ id }) => api.delete<{ ok: true }>(`/symptoms/${id}`),
    apply: (current, { id }) => removeItem(current, id),
    errorMessageKey: "toastErrors.deleteSymptom",
    alsoInvalidate: invalidateStats,
  });
}
