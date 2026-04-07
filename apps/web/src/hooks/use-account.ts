import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { signOut } from "@/lib/auth-client";

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () =>
      api.delete<{ ok: boolean }>("/account", { confirmation: "DELETE" }),
    onSuccess: () => {
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

export function useExportAccount() {
  return useMutation({
    mutationFn: async () => {
      const data = await api.get<Record<string, unknown>>("/account/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `toko-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });
}
