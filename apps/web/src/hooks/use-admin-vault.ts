import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "@/lib/i18n";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  AdminDocument,
  UpdateAdminDocumentMetadata,
} from "@focusflow/validators";

export const adminVaultKeys = {
  all: (childId: string) => ["admin-vault", childId] as const,
};

export function useAdminDocuments(childId: string) {
  return useQuery({
    queryKey: adminVaultKeys.all(childId),
    queryFn: () => api.get<AdminDocument[]>(`/admin-vault/${childId}`),
    enabled: !!childId,
  });
}

export function useUploadAdminDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      childId,
      category,
      title,
      description,
      occurredOn,
    }: {
      file: File;
      childId: string;
      category: string;
      title: string;
      description?: string;
      occurredOn?: string;
    }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("childId", childId);
      form.append("category", category);
      form.append("title", title);
      if (description) form.append("description", description);
      if (occurredOn) form.append("occurredOn", occurredOn);
      return api.postForm<AdminDocument>("/admin-vault", form);
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: adminVaultKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.uploadDocument")),
  });
}

export function useUpdateAdminDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId: _childId,
      ...data
    }: UpdateAdminDocumentMetadata & { id: string; childId: string }) =>
      api.patch<AdminDocument>(`/admin-vault/${id}`, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: adminVaultKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.editDocument")),
  });
}

export function useDeleteAdminDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, childId: _childId }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/admin-vault/${id}`),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: adminVaultKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.deleteDocument")),
  });
}

export function downloadAdminDocumentUrl(id: string): string {
  return `/api/admin-vault/${id}/download`;
}

export function previewAdminDocumentUrl(id: string): string {
  return `/api/admin-vault/${id}/download?inline=1`;
}
