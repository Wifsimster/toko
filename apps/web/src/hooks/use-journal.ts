import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  JournalEntry,
  CreateJournalEntry,
  UpdateJournalEntry,
} from "@focusflow/validators";
import {
  optimisticId,
  patchItem,
  prependItem,
  removeItem,
  useOptimisticListMutation,
} from "@/lib/query/optimistic-list";

const journalKeys = {
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
  return useOptimisticListMutation<
    JournalEntry,
    CreateJournalEntry,
    JournalEntry
  >({
    queryKey: ({ childId }) => journalKeys.all(childId),
    mutationFn: (data) => api.post<JournalEntry>("/journal", data),
    apply: (current, variables) => {
      const now = new Date().toISOString();
      return prependItem(current, {
        ...variables,
        text: variables.text ?? "",
        tags: variables.tags ?? [],
        id: optimisticId(),
        createdAt: now,
        updatedAt: now,
      });
    },
    errorMessageKey: "toastErrors.saveJournal",
  });
}

export function useUpdateJournalEntry() {
  return useOptimisticListMutation<
    JournalEntry,
    UpdateJournalEntry & { id: string; childId: string },
    JournalEntry
  >({
    queryKey: ({ childId }) => journalKeys.all(childId),
    mutationFn: ({ id, childId: _childId, ...data }) =>
      api.patch<JournalEntry>(`/journal/${id}`, data),
    apply: (current, variables) =>
      patchItem(current, variables.id, {
        ...variables,
        updatedAt: new Date().toISOString(),
      }),
    errorMessageKey: "toastErrors.editJournal",
  });
}

export function useDeleteJournalEntry() {
  return useOptimisticListMutation<
    JournalEntry,
    { id: string; childId: string },
    { ok: true }
  >({
    queryKey: ({ childId }) => journalKeys.all(childId),
    mutationFn: ({ id }) => api.delete<{ ok: true }>(`/journal/${id}`),
    apply: (current, { id }) => removeItem(current, id),
    errorMessageKey: "toastErrors.deleteJournal",
  });
}
