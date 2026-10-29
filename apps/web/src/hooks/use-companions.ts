import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  CompanionDiscovery,
  RecordCompanionDiscovery,
} from "@focusflow/validators";

const companionsKeys = {
  all: (childId: string) => ["companions", childId] as const,
};

export function useCompanions(childId: string) {
  return useQuery({
    queryKey: companionsKeys.all(childId),
    queryFn: () => api.get<CompanionDiscovery[]>(`/companions/${childId}`),
    enabled: !!childId,
  });
}

export function useRecordCompanion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordCompanionDiscovery) =>
      api.post<{ alreadyDiscovered: boolean }>("/companions", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: companionsKeys.all(variables.childId),
      }),
  });
}
