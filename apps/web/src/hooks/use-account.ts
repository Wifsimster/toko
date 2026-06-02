import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { signOut } from "@/lib/auth-client";
import { todayISO } from "@/lib/date";

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
