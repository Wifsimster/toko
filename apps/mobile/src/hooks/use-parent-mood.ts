import type { ParentMoodLog, UpsertParentMood } from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

const KEY = ["parent-mood"] as const;

export function useParentMood(days = 14) {
  return useQuery({
    queryKey: [...KEY, days],
    queryFn: () =>
      api.get<ParentMoodLog[]>(`/parent-mood?days=${days}`),
  });
}

export function useUpsertParentMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertParentMood) =>
      api.post<ParentMoodLog>("/parent-mood", data),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
