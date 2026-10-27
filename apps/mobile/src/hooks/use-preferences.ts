import type {
  MobileTabId,
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

/**
 * Enregistre la barre d'onglets du compte (`null` = barre par défaut). Pas de
 * mise à jour optimiste : la barre change quand le serveur a confirmé, et le
 * cache local suit (navigation/tabs.tsx). Hors ligne, la mutation attend le
 * retour du réseau (`isPaused`).
 */
export function useSaveMobileTabs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mobileTabs: MobileTabId[] | null) =>
      api.patch<UserPreferences & { userId: string }>("/preferences", { mobileTabs }),
    onSuccess: (row) => {
      qc.setQueryData<UserPreferences & { userId: string }>(KEY, (old) =>
        old ? { ...old, mobileTabs: row.mobileTabs ?? null } : old,
      );
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
