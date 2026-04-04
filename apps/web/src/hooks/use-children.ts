import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Child, CreateChild, UpdateChild } from "@focusflow/validators";

export const childrenKeys = {
  all: ["children"] as const,
  detail: (id: string) => ["children", id] as const,
};

export function useChildren() {
  return useQuery({
    queryKey: childrenKeys.all,
    queryFn: () => api.get<Child[]>("/children"),
  });
}

export function useChild(id: string) {
  return useQuery({
    queryKey: childrenKeys.detail(id),
    queryFn: () => api.get<Child>(`/children/${id}`),
    enabled: !!id,
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChild) => api.post<Child>("/children", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: childrenKeys.all }),
    onError: () => toast.error("Impossible d'ajouter l'enfant"),
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateChild & { id: string }) =>
      api.patch<Child>(`/children/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: childrenKeys.all });
      queryClient.invalidateQueries({ queryKey: childrenKeys.detail(variables.id) });
    },
    onError: () => toast.error("Impossible de modifier l'enfant"),
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: true }>(`/children/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: childrenKeys.all }),
    onError: () => toast.error("Impossible de supprimer l'enfant"),
  });
}
