import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { News, CreateNews, UpdateNews } from "@focusflow/validators";
import { toast } from "sonner";
import i18n from "@/lib/i18n";

export const newsKeys = {
  all: ["news"] as const,
  detail: (slug: string) => ["news", slug] as const,
  admin: ["news", "admin"] as const,
  adminDetail: (id: string) => ["news", "admin", id] as const,
  checkAdmin: ["news", "check-admin"] as const,
};

export function useNews() {
  return useQuery({
    queryKey: newsKeys.all,
    queryFn: () => api.get<News[]>("/news"),
  });
}

export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: newsKeys.detail(slug),
    queryFn: () => api.get<News>(`/news/${slug}`),
    enabled: !!slug,
  });
}

export function useIsNewsAdmin() {
  return useQuery({
    queryKey: newsKeys.checkAdmin,
    queryFn: () => api.get<{ isAdmin: boolean }>("/news/check-admin"),
  });
}

export function useAdminNews() {
  return useQuery({
    queryKey: newsKeys.admin,
    queryFn: () => api.get<News[]>("/news/admin"),
  });
}

export function useAdminNewsArticle(id: string) {
  return useQuery({
    queryKey: newsKeys.adminDetail(id),
    queryFn: () => api.get<News>(`/news/admin/${id}`),
    enabled: !!id,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNews) => api.post<News>("/news", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.admin });
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
      toast.success(i18n.t("newsAdmin.created"));
    },
    onError: () => toast.error(i18n.t("newsAdmin.createError")),
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateNews & { id: string }) =>
      api.patch<News>(`/news/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.admin });
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
      toast.success(i18n.t("newsAdmin.updated"));
    },
    onError: () => toast.error(i18n.t("newsAdmin.updateError")),
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/news/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.admin });
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
      toast.success(i18n.t("newsAdmin.deleted"));
    },
    onError: () => toast.error(i18n.t("newsAdmin.deleteError")),
  });
}
