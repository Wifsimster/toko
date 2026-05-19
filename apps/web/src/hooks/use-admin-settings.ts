import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api-client";
import type { AppSettings, UpdateAppSettings } from "@focusflow/validators";

// The settings row as returned by the API: the editable fields plus the
// server-managed id and audit columns.
export type AdminSettings = AppSettings & {
  id: string;
  updatedAt: string;
  updatedBy: string | null;
};

export const adminSettingsKeys = {
  all: ["admin-settings"] as const,
};

export function useAdminSettings() {
  return useQuery({
    queryKey: adminSettingsKeys.all,
    queryFn: () => api.get<AdminSettings>("/admin/settings"),
    retry: false,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateAppSettings) =>
      api.patch<AdminSettings>("/admin/settings", patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(adminSettingsKeys.all, updated);
      toast.success("Paramètres enregistrés.");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Impossible d'enregistrer les paramètres.",
      );
    },
  });
}
