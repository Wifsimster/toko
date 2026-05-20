import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { authClient } from "@/lib/auth-client";

export interface PasskeySummary {
  id: string;
  name: string | null;
  deviceType: string;
  createdAt: string;
}

export const passkeysKeys = {
  all: ["passkeys"] as const,
};

// Goes directly through the Better Auth mount (`/api/auth/passkey/*`)
// rather than the project's REST client — passkey endpoints aren't part
// of the Hono router, they're served by Better Auth itself.
async function fetchPasskeys(): Promise<PasskeySummary[]> {
  const res = await fetch("/api/auth/passkey/list-user-passkeys", {
    credentials: "include",
  });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => [])) as PasskeySummary[];
  return Array.isArray(data) ? data : [];
}

export function useListPasskeys() {
  return useQuery({
    queryKey: passkeysKeys.all,
    queryFn: fetchPasskeys,
  });
}

export function useAddPasskey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const result = await authClient.passkey.addPasskey({
        name,
        // Force the device's built-in authenticator (Touch ID, Face ID,
        // Windows Hello) — security keys plugged into USB aren't a
        // realistic target for parents on phones/tablets.
        authenticatorAttachment: "platform",
      });
      if (result?.error) {
        throw new Error(String(result.error.message ?? "passkey_add_failed"));
      }
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: passkeysKeys.all });
      toast.success(i18n.t("passkey.addSuccess"));
    },
    onError: (err: Error) => {
      // Cancellation by the user (closing the OS prompt) is not an error
      // worth surfacing — it's the expected "I changed my mind" path.
      const cancelled = /cancel|abort|notallowed/i.test(err.message);
      if (!cancelled) toast.error(i18n.t("passkey.addError"));
    },
  });
}

export function useDeletePasskey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await authClient.passkey.deletePasskey({ id });
      if (result?.error) {
        throw new Error(String(result.error.message ?? "passkey_delete_failed"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: passkeysKeys.all });
      toast.success(i18n.t("passkey.deleteSuccess"));
    },
    onError: () => toast.error(i18n.t("passkey.deleteError")),
  });
}
