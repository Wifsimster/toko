import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api-client";
import type { UpdateUserPremium, UpdateUserRole } from "@focusflow/validators";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
  premiumGranted: boolean;
  deletionScheduledAt: string | null;
  createdAt: string;
  subscriptionStatus: string | null;
  subscriptionPausedUntil: string | null;
  subscriptionCancelAtPeriodEnd: boolean | null;
};

// The PATCH endpoints return only the mutated account row (no subscription
// join), which is all the success toast needs.
type AdminUserAccount = Pick<
  AdminUser,
  "id" | "name" | "isAdmin" | "premiumGranted"
>;

export const adminUsersKeys = {
  all: ["admin-users"] as const,
};

export function useAdminUsers() {
  return useQuery({
    queryKey: adminUsersKeys.all,
    queryFn: () => api.get<AdminUser[]>("/admin/users"),
    retry: false,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAdmin }: UpdateUserRole & { id: string }) =>
      api.patch<AdminUserAccount>(`/admin/users/${id}/role`, { isAdmin }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      toast.success(
        updated.isAdmin
          ? `${updated.name} est maintenant administrateur.`
          : `${updated.name} n'est plus administrateur.`,
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Impossible de modifier le rôle de cet utilisateur.",
      );
    },
  });
}

export function useUpdateUserPremium() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, premiumGranted }: UpdateUserPremium & { id: string }) =>
      api.patch<AdminUserAccount>(`/admin/users/${id}/premium`, {
        premiumGranted,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      toast.success(
        updated.premiumGranted
          ? `Accès premium accordé à ${updated.name}.`
          : `Accès premium retiré à ${updated.name}.`,
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Impossible de modifier l'accès premium de cet utilisateur.",
      );
    },
  });
}
