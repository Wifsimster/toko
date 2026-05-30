import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api-client";
import type {
  BlockUser,
  UpdateUserPremium,
  UpdateUserRole,
} from "@focusflow/validators";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  // Better Auth sign-in methods: "credential" (e-mail/password), "google".
  authProviders: string[];
  isAdmin: boolean;
  premiumGranted: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
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
  "id" | "name" | "isAdmin" | "premiumGranted" | "isBlocked"
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

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isBlocked, reason }: BlockUser & { id: string }) =>
      api.patch<AdminUserAccount>(`/admin/users/${id}/block`, {
        isBlocked,
        reason,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      toast.success(
        updated.isBlocked
          ? `Le compte de ${updated.name} a été bloqué.`
          : `Le compte de ${updated.name} a été débloqué.`,
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Impossible de modifier le statut de ce compte.",
      );
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ email: string; name: string }>(
        `/admin/users/${id}/reset-password`,
        {},
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      toast.success(
        `Un lien de réinitialisation a été envoyé à ${res.email}.`,
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Impossible d'envoyer le lien de réinitialisation.",
      );
    },
  });
}

export function useScheduleUserDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<AdminUserAccount>(`/admin/users/${id}/schedule-deletion`, {}),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      toast.success(
        `La suppression du compte de ${updated.name} est programmée. Les données seront effacées dans 30 jours.`,
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Impossible de programmer la suppression de ce compte.",
      );
    },
  });
}

export function useCancelUserDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<AdminUserAccount>(`/admin/users/${id}/cancel-deletion`, {}),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      toast.success(
        `La suppression du compte de ${updated.name} a été annulée.`,
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Impossible d'annuler la suppression de ce compte.",
      );
    },
  });
}
