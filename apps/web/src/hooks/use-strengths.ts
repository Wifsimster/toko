import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "@/lib/i18n";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  Strength,
  CreateStrength,
  UpdateStrength,
} from "@focusflow/validators";

const strengthsKeys = {
  all: (childId: string) => ["strengths", childId] as const,
};

export function useStrengths(childId: string) {
  return useQuery({
    queryKey: strengthsKeys.all(childId),
    queryFn: () => api.get<Strength[]>(`/strengths/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateStrength() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStrength) =>
      api.post<Strength>("/strengths", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: strengthsKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.addStrength")),
  });
}

export function useUpdateStrength() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId: _childId,
      ...data
    }: UpdateStrength & { id: string; childId: string }) =>
      api.patch<Strength>(`/strengths/${id}`, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: strengthsKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.editStrength")),
  });
}

export function useDeleteStrength() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, childId: _childId }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/strengths/${id}`),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: strengthsKeys.all(variables.childId),
      }),
    onError: () => toast.error(i18n.t("toastErrors.deleteStrength")),
  });
}
