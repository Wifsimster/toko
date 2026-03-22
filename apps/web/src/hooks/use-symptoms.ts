import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Symptom, CreateSymptom } from "@focusflow/validators";

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
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: symptomKeys.all(variables.childId),
      }),
  });
}
