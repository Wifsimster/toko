import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Medication, CreateMedication } from "@focusflow/validators";

export const medicationKeys = {
  all: (childId: string) => ["medications", childId] as const,
};

export function useMedications(childId: string) {
  return useQuery({
    queryKey: medicationKeys.all(childId),
    queryFn: () => api.get<Medication[]>(`/medications/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedication) =>
      api.post<Medication>("/medications", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: medicationKeys.all(variables.childId),
      }),
  });
}
