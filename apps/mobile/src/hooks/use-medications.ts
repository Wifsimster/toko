import type {
  CreateMedication,
  Medication,
  UpdateMedication,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-medications.ts: list a child's treatments and
// add / edit / remove them. Authoring is allowed on mobile (simple CRUD).
const key = (childId: string) => ["medications", childId] as const;

export function useMedications(childId: string) {
  return useQuery({
    queryKey: key(childId),
    queryFn: () => api.get<Medication[]>(`/medications/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateMedication(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedication) =>
      api.post<Medication>("/medications", data),
    onSettled: () => qc.invalidateQueries({ queryKey: key(childId) }),
  });
}

export function useUpdateMedication(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateMedication & { id: string }) =>
      api.patch<Medication>(`/medications/${id}`, data),
    onSettled: () => qc.invalidateQueries({ queryKey: key(childId) }),
  });
}

export function useDeleteMedication(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: true }>(`/medications/${id}`),
    onSettled: () => qc.invalidateQueries({ queryKey: key(childId) }),
  });
}
