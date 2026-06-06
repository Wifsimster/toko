import type {
  CreateJournalEntry,
  JournalEntry,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors apps/web/src/hooks/use-journal.ts (query key ["journal", childId],
// optimistic create/delete, invalidate on settle). Offline pause/resume comes
// from the global onlineManager wiring; journal entries are not persisted
// across a cold restart (only the evening check-in is — see App.tsx).
const journalKey = (childId: string) => ["journal", childId] as const;

export function useJournal(childId: string) {
  return useQuery({
    queryKey: journalKey(childId),
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
      const key = journalKey(variables.childId);
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
        old ? [optimistic, ...old] : [optimistic],
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: journalKey(variables.childId) });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/journal/${id}`),
    onMutate: async (variables) => {
      const key = journalKey(variables.childId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<JournalEntry[]>(key);
      queryClient.setQueryData<JournalEntry[]>(key, (old) =>
        old ? old.filter((e) => e.id !== variables.id) : old,
      );
      return { previous, key };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: journalKey(variables.childId) });
    },
  });
}
