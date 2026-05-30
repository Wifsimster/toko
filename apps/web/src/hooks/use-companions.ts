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
    // Recording a discovery is a quiet background nicety. If it fails we stay
    // silent on purpose — an error toast right after a calm timer finish
    // would be a jarring "surprise" the child never asked for.
  });
}
