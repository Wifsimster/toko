import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { api } from "@/lib/api-client";
import type {
  SolidarityRequest,
  SolidarityRequestInput,
} from "@focusflow/validators";

const solidarityKeys = {
  mine: ["solidarity", "mine"] as const,
};

export function useMySolidarityRequest() {
  return useQuery({
    queryKey: solidarityKeys.mine,
    queryFn: () => api.get<SolidarityRequest | null>("/solidarity/mine"),
  });
}

export function useCreateSolidarityRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SolidarityRequestInput) =>
      api.post<SolidarityRequest>("/solidarity", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: solidarityKeys.mine });
      toast.success(i18n.t("solidarity.submitted"));
    },
    onError: (err: unknown) => {
      const code =
        err && typeof err === "object" && "code" in err
          ? (err as { code?: string }).code
          : undefined;
      toast.error(
        code === "SOLIDARITY_REQUEST_PENDING"
          ? i18n.t("solidarity.alreadyPending")
          : i18n.t("solidarity.submitError"),
      );
    },
  });
}
