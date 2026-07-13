import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { api } from "@/lib/api-client";
import { signOut } from "@/lib/auth-client";
import { todayISO } from "@/lib/date";

const deletionStatusKey = ["deletion-status"] as const;

export function useDeletionStatus() {
  return useQuery({
    queryKey: deletionStatusKey,
    queryFn: () => api.get<{ scheduledAt: string | null }>("/account/deletion-status"),
    staleTime: 60_000,
  });
}

export function useScheduleDeletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ scheduled: boolean }>("/account/schedule-deletion", {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deletionStatusKey });
      toast.success(i18n.t("account.deletion.scheduledToast"));
    },
    onError: () => toast.error(i18n.t("account.deletion.scheduleError")),
  });
}

export function useCancelDeletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ scheduled: boolean }>("/account/cancel-deletion", {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deletionStatusKey });
      toast.success(i18n.t("account.deletion.cancelToast"));
    },
    onError: () => toast.error(i18n.t("account.deletion.cancelError")),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.delete<{ ok: boolean }>("/account", { confirmation: "DELETE" }),
    onSuccess: () => {
      // The account no longer exists — drop every cached query before the
      // session is torn down so nothing stale survives the redirect.
      queryClient.clear();
      signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
        },
      });
    },
  });
}

// Account export is a read-only download, not a server mutation, so it is a
// plain async action with mutation-like flags rather than a useMutation (which
// would imply cache invalidation that doesn't apply here).
export function useExportAccount() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = async () => {
    setIsPending(true);
    setIsSuccess(false);
    try {
      const data = await api.get<Record<string, unknown>>("/account/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `toko-export-${todayISO()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsSuccess(true);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, isSuccess };
}
