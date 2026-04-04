import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  CrisisItem,
  CreateCrisisItem,
  UpdateCrisisItem,
} from "@focusflow/validators";

export const crisisListKeys = {
  all: (childId: string) => ["crisis-list", childId] as const,
};

export function useCrisisItems(childId: string) {
  return useQuery({
    queryKey: crisisListKeys.all(childId),
    queryFn: () => api.get<CrisisItem[]>(`/crisis-list/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateCrisisItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCrisisItem) =>
      api.post<CrisisItem>("/crisis-list", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: crisisListKeys.all(variables.childId),
      }),
    onError: () => toast.error("Impossible d'ajouter l'élément"),
  });
}

export function useUpdateCrisisItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId,
      ...data
    }: UpdateCrisisItem & { id: string; childId: string }) =>
      api.patch<CrisisItem>(`/crisis-list/${id}`, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: crisisListKeys.all(variables.childId),
      }),
    onError: () => toast.error("Impossible de modifier l'élément"),
  });
}

export function useDeleteCrisisItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, childId }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/crisis-list/${id}`),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: crisisListKeys.all(variables.childId),
      }),
    onError: () => toast.error("Impossible de supprimer l'élément"),
  });
}

export function useReorderCrisisItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      childId,
      orderedIds,
    }: {
      childId: string;
      orderedIds: string[];
    }) => api.post<CrisisItem[]>(`/crisis-list/${childId}/reorder`, { orderedIds }),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: crisisListKeys.all(variables.childId),
      }),
  });
}
