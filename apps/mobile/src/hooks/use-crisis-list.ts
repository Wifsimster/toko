import type {
  CreateCrisisItem,
  CrisisItem,
  UpdateCrisisItem,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-crisis-list.ts (query key ["crisis-list",
// childId], optimistic create/delete). Reorder/edit stay on the web.
const crisisKey = (childId: string) => ["crisis-list", childId] as const;

export function useCrisisItems(childId: string) {
  return useQuery({
    queryKey: crisisKey(childId),
    queryFn: () => api.get<CrisisItem[]>(`/crisis-list/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateCrisisItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCrisisItem) =>
      api.post<CrisisItem>("/crisis-list", data),
    onMutate: async (variables) => {
      const key = crisisKey(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CrisisItem[]>(key);
      const now = new Date().toISOString();
      const optimistic: CrisisItem = {
        ...variables,
        position: variables.position ?? (previous?.length ?? 0),
        id: `optimistic-${now}`,
        createdAt: now,
        updatedAt: now,
      };
      queryClient.setQueryData<CrisisItem[]>(key, (old) =>
        old ? [...old, optimistic] : [optimistic],
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: crisisKey(variables.childId) });
    },
  });
}

export function useUpdateCrisisItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId: _childId,
      ...data
    }: UpdateCrisisItem & { id: string; childId: string }) =>
      api.patch<CrisisItem>(`/crisis-list/${id}`, data),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: crisisKey(variables.childId) });
    },
  });
}

export function useDeleteCrisisItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/crisis-list/${id}`),
    onMutate: async (variables) => {
      const key = crisisKey(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CrisisItem[]>(key);
      queryClient.setQueryData<CrisisItem[]>(key, (old) =>
        old ? old.filter((i) => i.id !== variables.id) : old,
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: crisisKey(variables.childId) });
    },
  });
}
