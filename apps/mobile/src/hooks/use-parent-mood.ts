import type { ParentMoodLog, UpsertParentMood } from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-parent-mood.ts (if it exists) or parent-mood route.
const KEY = ["parent-mood"] as const;

/** Fetch the last N days of mood logs (default: 14). */
export function useParentMood(days = 14) {
  return useQuery({
    queryKey: [...KEY, days],
    queryFn: () =>
      api.get<ParentMoodLog[]>(`/parent-mood?days=${days}`),
  });
}

/** Submit or overwrite today's mood entry. */
export function useUpsertParentMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertParentMood) =>
      api.post<ParentMoodLog>("/parent-mood", data),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
