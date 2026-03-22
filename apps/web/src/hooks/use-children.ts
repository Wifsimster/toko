import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Child, CreateChild } from "@focusflow/validators";

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
  });
}
