import type {
  CreateMedication,
  CreateMedicationLog,
  Medication,
  MedicationLog,
  UpdateMedication,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-medications.ts: list a child's treatments and
// add / edit / remove them. Authoring is allowed on mobile (simple CRUD).
const key = (childId: string) => ["medications", childId] as const;
const adherenceKey = (childId: string) =>
  ["medications", childId, "adherence"] as const;

export interface MedicationAdherence {
  id: string;
  name: string;
  dose: string | null;
  schedule: string;
  adherenceRate: number | null;
  takenCount: number;
  loggedCount: number;
  todayTaken: boolean | null;
}

/** Today's status + adherence rate per treatment (last 30 days). */
export function useMedicationAdherence(childId: string) {
  return useQuery({
    queryKey: adherenceKey(childId),
    queryFn: () =>
      api.get<{ medications: MedicationAdherence[] }>(
        `/medications/${childId}/adherence`,
      ),
    enabled: !!childId,
    staleTime: 60_000,
  });
}

/** Log a medication as taken / missed for a date (1-tap from the dashboard). */
export function useLogMedication(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicationLog) =>
      api.post<MedicationLog>("/medications/logs", data),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: adherenceKey(childId) }),
  });
}

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
