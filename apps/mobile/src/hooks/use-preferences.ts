import {
  checkMobileTabsSaved,
  type MobileTabId,
  type UpdateUserPreferences,
  type UserPreferences,
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
 * Le serveur a répondu 200 sans enregistrer la barre : API qui ne connaît pas
 * encore ce réglage (`unsupported`, elle enlève le champ), ou autre barre
 * renvoyée (`mismatch`). La mutation échoue : brouillon, barre et cache
 * restent tels quels.
 */
export class MobileTabsNotSavedError extends Error {
  constructor(readonly reason: "unsupported" | "mismatch") {
    super(`mobileTabs not saved (${reason})`);
    this.name = "MobileTabsNotSavedError";
  }
}

/**
 * Enregistre la barre d'onglets du compte (`null` = barre par défaut). Pas de
 * mise à jour optimiste : la barre change quand le serveur a confirmé, et le
 * cache local suit (navigation/tabs.tsx). La réponse est vérifiée
 * (`checkMobileTabsSaved`) : un 200 qui n'a pas enregistré la barre est une
 * erreur, jamais un retour à la barre par défaut. Hors ligne, la mutation
 * attend le retour du réseau (`isPaused`).
 */
export function useSaveMobileTabs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mobileTabs: MobileTabId[] | null) => {
      const row = await api.patch<unknown>("/preferences", { mobileTabs });
      const check = checkMobileTabsSaved(mobileTabs, row);
      if (!check.ok) throw new MobileTabsNotSavedError(check.reason);
      return check.tabs;
    },
    onSuccess: (tabs) => {
      qc.setQueryData<UserPreferences & { userId: string }>(KEY, (old) =>
        old ? { ...old, mobileTabs: tabs } : old,
      );
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
