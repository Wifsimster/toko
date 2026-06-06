import type {
  CreateStrength,
  Strength,
  UpdateStrength,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-strengths.ts: list a child's strengths and
// add / edit / remove them. Simple CRUD, fully native.
const key = (childId: string) => ["strengths", childId] as const;

export function useStrengths(childId: string) {
  return useQuery({
    queryKey: key(childId),
    queryFn: () => api.get<Strength[]>(`/strengths/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateStrength(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStrength) =>
      api.post<Strength>("/strengths", data),
    onSettled: () => qc.invalidateQueries({ queryKey: key(childId) }),
  });
}

export function useUpdateStrength(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateStrength & { id: string }) =>
      api.patch<Strength>(`/strengths/${id}`, data),
    onSettled: () => qc.invalidateQueries({ queryKey: key(childId) }),
  });
}

export function useDeleteStrength(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: true }>(`/strengths/${id}`),
    onSettled: () => qc.invalidateQueries({ queryKey: key(childId) }),
  });
}
