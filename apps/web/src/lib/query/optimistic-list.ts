import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";

export interface OptimisticListMutationOptions<TItem, TVars, TResult> {
  queryKey: (variables: TVars) => QueryKey;
  mutationFn: (variables: TVars) => Promise<TResult>;
  apply: (
    current: TItem[] | undefined,
    variables: TVars,
    tempId: string,
  ) => TItem[] | undefined;
  replaceOptimisticWithResult?: boolean;
  errorMessageKey: string;
  alsoInvalidate?: (variables: TVars) => QueryKey[];
}

export interface OptimisticRollback<TItem> {
  previous: TItem[] | undefined;
  key: QueryKey;
  tempId: string;
}

export function useOptimisticListMutation<TItem, TVars, TResult = unknown>(
  options: OptimisticListMutationOptions<TItem, TVars, TResult>,
): UseMutationResult<TResult, Error, TVars, OptimisticRollback<TItem>> {
  const queryClient = useQueryClient();

  return useMutation<TResult, Error, TVars, OptimisticRollback<TItem>>({
    mutationFn: options.mutationFn,
    onMutate: async (variables) => {
      const key = options.queryKey(variables);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TItem[]>(key);
      const tempId = optimisticId();
      queryClient.setQueryData<TItem[]>(key, (current) =>
        options.apply(current, variables, tempId),
      );
      return { previous, key, tempId };
    },
    onSuccess: (data, _variables, context) => {
      if (!options.replaceOptimisticWithResult || !context) return;
      queryClient.setQueryData<TItem[]>(context.key, (current) =>
        replaceItem(current, context.tempId, data as unknown as TItem),
      );
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error(i18n.t(options.errorMessageKey));
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: options.queryKey(variables) });
      for (const key of options.alsoInvalidate?.(variables) ?? []) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export function prependItem<TItem>(
  current: TItem[] | undefined,
  item: TItem,
): TItem[] {
  return current ? [item, ...current] : [item];
}

export function patchItem<TItem extends { id: string }>(
  current: TItem[] | undefined,
  id: string,
  patch: Partial<TItem>,
): TItem[] | undefined {
  return current?.map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  );
}

export function replaceItem<TItem>(
  current: TItem[] | undefined,
  id: string,
  item: TItem,
): TItem[] | undefined {
  return current?.map((existing) =>
    (existing as { id?: unknown }).id === id ? item : existing,
  );
}

export function removeItem<TItem extends { id: string }>(
  current: TItem[] | undefined,
  id: string,
): TItem[] | undefined {
  return current?.filter((item) => item.id !== id);
}

export function isOptimisticId(id: string): boolean {
  return id.startsWith("optimistic-");
}

export function optimisticId(): string {
  return `optimistic-${new Date().toISOString()}-${Math.random().toString(36).slice(2, 8)}`;
}
