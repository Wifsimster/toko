import type {
  CompanionDiscovery,
  RecordCompanionDiscovery,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-companions.ts: list a child's discovered
// timer companions and record a new discovery when a timer completes.
const key = (childId: string) => ["companions", childId] as const;

export function useCompanions(childId: string) {
  return useQuery({
    queryKey: key(childId),
    queryFn: () => api.get<CompanionDiscovery[]>(`/companions/${childId}`),
    enabled: !!childId,
  });
}

export function useRecordCompanion(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordCompanionDiscovery) =>
      api.post<{ alreadyDiscovered: boolean }>("/companions", data),
    onSettled: () => qc.invalidateQueries({ queryKey: key(childId) }),
  });
}
