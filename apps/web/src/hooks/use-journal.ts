import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "@/lib/i18n";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  JournalEntry,
  CreateJournalEntry,
  UpdateJournalEntry,
} from "@focusflow/validators";

export const journalKeys = {
  all: (childId: string) => ["journal", childId] as const,
};

export function useJournal(childId: string) {
  return useQuery({
    queryKey: journalKeys.all(childId),
    queryFn: () => api.get<JournalEntry[]>(`/journal/${childId}`),
    enabled: !!childId,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalEntry) =>
      api.post<JournalEntry>("/journal", data),
    onMutate: async (variables) => {
      const key = journalKeys.all(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<JournalEntry[]>(key);
      const now = new Date().toISOString();
      const optimistic: JournalEntry = {
        ...variables,
        text: variables.text ?? "",
        tags: variables.tags ?? [],
        id: `optimistic-${now}`,
        createdAt: now,
        updatedAt: now,
      };
      queryClient.setQueryData<JournalEntry[]>(key, (old) =>
        old ? [optimistic, ...old] : [optimistic]
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error(i18n.t("toastErrors.saveJournal"));
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: journalKeys.all(variables.childId),
      });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId: _childId,
      ...data
    }: UpdateJournalEntry & { id: string; childId: string }) =>
      api.patch<JournalEntry>(`/journal/${id}`, data),
    onMutate: async (variables) => {
      const key = journalKeys.all(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<JournalEntry[]>(key);
      queryClient.setQueryData<JournalEntry[]>(key, (old) =>
        old
          ? old.map((entry) =>
              entry.id === variables.id
                ? { ...entry, ...variables, updatedAt: new Date().toISOString() }
                : entry
            )
          : old
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error(i18n.t("toastErrors.editJournal"));
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: journalKeys.all(variables.childId),
      });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/journal/${id}`),
    onMutate: async (variables) => {
      const key = journalKeys.all(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<JournalEntry[]>(key);
      queryClient.setQueryData<JournalEntry[]>(key, (old) =>
        old ? old.filter((entry) => entry.id !== variables.id) : old
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error(i18n.t("toastErrors.deleteJournal"));
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: journalKeys.all(variables.childId),
      });
    },
  });
}
