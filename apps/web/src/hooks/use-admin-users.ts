import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api-client";
import type { UpdateUserRole } from "@focusflow/validators";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
  deletionScheduledAt: string | null;
  createdAt: string;
};

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
      api.patch<AdminUser>(`/admin/users/${id}/role`, { isAdmin }),
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
