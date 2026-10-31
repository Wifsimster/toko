import type { UpdateUserPreferences, UserPreferences } from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

const KEY = ["preferences"] as const;

export function usePreferences() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<UserPreferences & { userId: string }>("/preferences"),
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserPreferences) =>
      api.patch<UserPreferences & { userId: string }>("/preferences", data),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
