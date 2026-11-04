import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { api } from "@/lib/api-client";
import type { CreatePause, Garden } from "@focusflow/validators";

export const pauseKeys = {
  garden: () => ["pauses", "garden"] as const,
};

export function useGarden() {
  return useQuery({
    queryKey: pauseKeys.garden(),
    queryFn: () => api.get<Garden>("/pauses/garden"),
  });
}

export function useRecordPause() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePause) => api.post<unknown>("/pauses", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pauseKeys.garden() }),
    onError: () => toast.error(i18n.t("toastErrors.savePause")),
  });
}
