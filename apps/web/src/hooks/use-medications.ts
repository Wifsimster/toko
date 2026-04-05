import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  Medication,
  CreateMedication,
  UpdateMedication,
  CreateMedicationLog,
  MedicationLog,
} from "@focusflow/validators";

export const medicationKeys = {
  all: (childId: string) => ["medications", childId] as const,
  adherence: (childId: string) =>
    ["medications", childId, "adherence"] as const,
};

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

export function useMedications(childId: string) {
  return useQuery({
    queryKey: medicationKeys.all(childId),
    queryFn: () => api.get<Medication[]>(`/medications/${childId}`),
    enabled: !!childId,
  });
}

export function useMedicationAdherence(childId: string) {
  return useQuery({
    queryKey: medicationKeys.adherence(childId),
    queryFn: () =>
      api.get<{ medications: MedicationAdherence[] }>(
        `/medications/${childId}/adherence`
      ),
    enabled: !!childId,
    staleTime: 60_000,
  });
}

export function useCreateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedication) =>
      api.post<Medication>("/medications", data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: medicationKeys.all(variables.childId) });
      qc.invalidateQueries({
        queryKey: medicationKeys.adherence(variables.childId),
      });
    },
    onError: () => toast.error("Impossible d'ajouter le traitement"),
  });
}

export function useUpdateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId: _childId,
      ...data
    }: UpdateMedication & { id: string; childId: string }) =>
      api.patch<Medication>(`/medications/${id}`, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: medicationKeys.all(variables.childId) });
      qc.invalidateQueries({
        queryKey: medicationKeys.adherence(variables.childId),
      });
    },
    onError: () => toast.error("Impossible de modifier le traitement"),
  });
}

export function useDeleteMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/medications/${id}`),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: medicationKeys.all(variables.childId) });
      qc.invalidateQueries({
        queryKey: medicationKeys.adherence(variables.childId),
      });
    },
    onError: () => toast.error("Impossible de supprimer le traitement"),
  });
}

export function useLogMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicationLog & { childId: string }) => {
      const { childId: _childId, ...body } = data;
      return api.post<MedicationLog>("/medications/logs", body);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: medicationKeys.adherence(variables.childId),
      });
    },
    onError: () => toast.error("Impossible d'enregistrer la prise"),
  });
}
