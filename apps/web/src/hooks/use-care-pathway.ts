import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "@/lib/i18n";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  CarePathwayProgress,
  UpsertCarePathwayProgress,
} from "@focusflow/validators";

export const carePathwayKeys = {
  all: (childId: string) => ["care-pathway", childId] as const,
};

export function useCarePathwayProgress(childId: string) {
  return useQuery({
    queryKey: carePathwayKeys.all(childId),
    queryFn: () =>
      api.get<CarePathwayProgress[]>(`/care-pathway/${childId}`),
    enabled: !!childId,
  });
}

export function useUpsertCarePathwayStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertCarePathwayProgress) =>
      api.post<CarePathwayProgress>("/care-pathway", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: carePathwayKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.saveCarePathway")),
  });
}
