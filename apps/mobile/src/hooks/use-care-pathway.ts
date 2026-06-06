import type {
  CarePathwayProgress,
  UpsertCarePathwayProgress,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-care-pathway.ts: fetch progress rows for a
// child and upsert a step's status (todo → doing → done, or any transition).
const key = (childId: string) => ["care-pathway", childId] as const;

export function useCarePathwayProgress(childId: string) {
  return useQuery({
    queryKey: key(childId),
    queryFn: () => api.get<CarePathwayProgress[]>(`/care-pathway/${childId}`),
    enabled: !!childId,
  });
}

export function useUpsertCarePathwayStep(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertCarePathwayProgress) =>
      api.post<CarePathwayProgress>("/care-pathway", data),
    onSettled: () => qc.invalidateQueries({ queryKey: key(childId) }),
  });
}
