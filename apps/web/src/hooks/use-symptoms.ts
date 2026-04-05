import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "@/lib/i18n";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Symptom, CreateSymptom, UpdateSymptom } from "@focusflow/validators";
import { statsKeys } from "@/hooks/use-stats";

export const symptomKeys = {
  all: (childId: string) => ["symptoms", childId] as const,
};

export function useSymptoms(childId: string) {
  return useQuery({
    queryKey: symptomKeys.all(childId),
    queryFn: () => api.get<Symptom[]>(`/symptoms/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSymptom) => api.post<Symptom>("/symptoms", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: symptomKeys.all(variables.childId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.child(variables.childId),
      });
    },
    onError: () => toast.error(i18n.t("toastErrors.saveSymptom")),
  });
}

export function useUpdateSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId,
      ...data
    }: UpdateSymptom & { id: string; childId: string }) =>
      api.patch<Symptom>(`/symptoms/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: symptomKeys.all(variables.childId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.child(variables.childId),
      });
    },
    onError: () => toast.error(i18n.t("toastErrors.editSymptom")),
  });
}

export function useDeleteSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/symptoms/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: symptomKeys.all(variables.childId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.child(variables.childId),
      });
    },
    onError: () => toast.error(i18n.t("toastErrors.deleteSymptom")),
  });
}
