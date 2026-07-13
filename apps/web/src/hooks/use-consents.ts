import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { api } from "@/lib/api-client";
import type { Consent, ConsentType } from "@focusflow/validators";

const consentsKey = ["consents"] as const;

export function useConsents() {
  return useQuery({
    queryKey: consentsKey,
    queryFn: () => api.get<Consent[]>("/account/consents"),
    staleTime: 5 * 60_000,
  });
}

export function useRevokeConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: ConsentType) =>
      api.delete<{ revoked: number }>(`/account/consents/${type}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consentsKey });
      toast.success(i18n.t("account.consent.revokeSuccess"));
    },
    onError: () => toast.error(i18n.t("account.consent.revokeError")),
  });
}
