import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: journalKeys.all(variables.childId),
      }),
    onError: () => toast.error("Impossible d'enregistrer l'entrée"),
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
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: journalKeys.all(variables.childId),
      }),
    onError: () => toast.error("Impossible de modifier l'entrée"),
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/journal/${id}`),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: journalKeys.all(variables.childId),
      }),
    onError: () => toast.error("Impossible de supprimer l'entrée"),
  });
}
