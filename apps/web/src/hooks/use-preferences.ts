import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { UpdateUserPreferences } from "@focusflow/validators";

export interface Preferences {
  userId: string;
  timezone: string;
  dailyReminderOptIn: boolean;
  weeklyDigestOptIn: boolean;
}

const preferencesKey = ["preferences"] as const;

export function usePreferences() {
  return useQuery({
    queryKey: preferencesKey,
    queryFn: () => api.get<Preferences>("/preferences"),
    staleTime: 5 * 60_000,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserPreferences) =>
      api.patch<Preferences>("/preferences", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: preferencesKey });
      toast.success("Préférences enregistrées");
    },
    onError: () => toast.error("Impossible d'enregistrer les préférences"),
  });
}
