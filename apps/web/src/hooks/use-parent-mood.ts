import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "@/lib/i18n";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  ParentMoodLog,
  UpsertParentMood,
} from "@focusflow/validators";

const parentMoodKeys = {
  recent: () => ["parent-mood", "recent"] as const,
};

export function useParentMoodHistory() {
  return useQuery({
    queryKey: parentMoodKeys.recent(),
    queryFn: () => api.get<ParentMoodLog[]>("/parent-mood?days=7"),
  });
}

export function useUpsertParentMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertParentMood) =>
      api.post<ParentMoodLog>("/parent-mood", data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: parentMoodKeys.recent() }),
    onError: () => toast.error(i18n.t("toastErrors.saveParentMood")),
  });
}
