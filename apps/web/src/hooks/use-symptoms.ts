import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "@/lib/i18n";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Symptom, CreateSymptom, UpdateSymptom } from "@focusflow/validators";
import { statsKeys } from "@/hooks/use-stats";

export const symptomKeys = {
  all: (childId: string) => ["symptoms", childId] as const,
};

export function useSymptoms(childId: string) {
  return useQuery({
    queryKey: symptomKeys.all(childId),
    queryFn: () => api.get<Symptom[]>(`/symptoms/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSymptom) => api.post<Symptom>("/symptoms", data),
    onMutate: async (variables) => {
      const key = symptomKeys.all(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Symptom[]>(key);
      const now = new Date().toISOString();
      const optimistic: Symptom = {
        ...variables,
        routinesOk: variables.routinesOk ?? true,
        id: `optimistic-${now}`,
        createdAt: now,
        updatedAt: now,
      };
      queryClient.setQueryData<Symptom[]>(key, (old) =>
        old ? [optimistic, ...old] : [optimistic]
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error(i18n.t("toastErrors.saveSymptom"));
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: symptomKeys.all(variables.childId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.child(variables.childId),
      });
    },
  });
}

export function useUpdateSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId,
      ...data
    }: UpdateSymptom & { id: string; childId: string }) =>
      api.patch<Symptom>(`/symptoms/${id}`, data),
    onMutate: async (variables) => {
      const key = symptomKeys.all(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Symptom[]>(key);
      queryClient.setQueryData<Symptom[]>(key, (old) =>
        old
          ? old.map((s) =>
              s.id === variables.id
                ? { ...s, ...variables, updatedAt: new Date().toISOString() }
                : s
            )
          : old
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error(i18n.t("toastErrors.editSymptom"));
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: symptomKeys.all(variables.childId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.child(variables.childId),
      });
    },
  });
}

export function useDeleteSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/symptoms/${id}`),
    onMutate: async (variables) => {
      const key = symptomKeys.all(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Symptom[]>(key);
      queryClient.setQueryData<Symptom[]>(key, (old) =>
        old ? old.filter((s) => s.id !== variables.id) : old
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error(i18n.t("toastErrors.deleteSymptom"));
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: symptomKeys.all(variables.childId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.child(variables.childId),
      });
    },
  });
}
