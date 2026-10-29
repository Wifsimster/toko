import { useMutation } from "@tanstack/react-query";

import { api } from "../lib/api";

export function useExportAccount() {
  return useMutation({
    mutationFn: () => api.get<Record<string, unknown>>("/account/export"),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () =>
      api.delete<{ ok: boolean }>("/account", { confirmation: "DELETE" }),
  });
}
