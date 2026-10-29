import {
  checkMobileTabsSaved,
  type MobileTabId,
  type UpdateUserPreferences,
  type UserPreferences,
} from "@focusflow/validators";
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

export class MobileTabsNotSavedError extends Error {
  constructor(readonly reason: "unsupported" | "mismatch") {
    super(`mobileTabs not saved (${reason})`);
    this.name = "MobileTabsNotSavedError";
  }
}

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
