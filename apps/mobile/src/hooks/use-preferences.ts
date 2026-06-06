import type {
  UpdateUserPreferences,
  UserPreferences,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-preferences.ts
const KEY = ["preferences"] as const;

/** Read the authenticated user's notification preferences. */
export function usePreferences() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<UserPreferences & { userId: string }>("/preferences"),
  });
}

/** Partial-update the preferences via PATCH /preferences. */
export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserPreferences) =>
      api.patch<UserPreferences & { userId: string }>("/preferences", data),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
