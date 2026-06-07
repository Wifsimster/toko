import { useMutation } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-account.ts (export + delete). RGPD data export
// and account deletion, both sensitive and rate-limited server-side.

/** Full personal data export (RGPD Art. 20). Returns the JSON payload. */
export function useExportAccount() {
  return useMutation({
    mutationFn: () => api.get<Record<string, unknown>>("/account/export"),
  });
}

/** Permanently delete the account (cancels Stripe + cascade deletes data). */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: () =>
      api.delete<{ ok: boolean }>("/account", { confirmation: "DELETE" }),
  });
}
