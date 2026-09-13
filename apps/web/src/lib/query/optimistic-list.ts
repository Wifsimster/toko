import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";

/**
 * Optimistic create/update/delete over a child-scoped list.
 *
 * Every one of these mutations does the same five things: cancel in-flight
 * queries for the list, snapshot it, write the optimistic version, roll the
 * snapshot back with a French toast on failure, and invalidate on settle.
 * That was written out longhand once per mutation per entity — fifteen
 * near-identical blocks between symptoms and journal alone, each an
 * opportunity to forget the rollback.
 *
 * Callers now supply only what actually differs: the list key, the request,
 * how the list changes, and which error copy to show.
 */
export interface OptimisticListMutationOptions<TItem, TVars, TResult> {
  /** Query key of the list this mutation changes. */
  queryKey: (variables: TVars) => QueryKey;
  mutationFn: (variables: TVars) => Promise<TResult>;
  /** The list as it should appear before the server answers. */
  apply: (current: TItem[] | undefined, variables: TVars) => TItem[] | undefined;
  /** i18n key for the toast shown when the mutation fails. */
  errorMessageKey: string;
  /** Extra keys to invalidate once the mutation settles (e.g. stats). */
  alsoInvalidate?: (variables: TVars) => QueryKey[];
}

/** Snapshot taken before the optimistic write, used to roll back. */
export interface OptimisticRollback<TItem> {
  previous: TItem[] | undefined;
  key: QueryKey;
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
      queryClient.setQueryData<TItem[]>(key, (current) =>
        options.apply(current, variables),
      );
      return { previous, key };
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

/** Prepends a freshly created item — the list is newest-first everywhere. */
export function prependItem<TItem>(
  current: TItem[] | undefined,
  item: TItem,
): TItem[] {
  return current ? [item, ...current] : [item];
}

/** Merges a patch into the matching item, leaving the rest untouched. */
export function patchItem<TItem extends { id: string }>(
  current: TItem[] | undefined,
  id: string,
  patch: Partial<TItem>,
): TItem[] | undefined {
  return current?.map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  );
}

/** Drops the matching item. */
export function removeItem<TItem extends { id: string }>(
  current: TItem[] | undefined,
  id: string,
): TItem[] | undefined {
  return current?.filter((item) => item.id !== id);
}

/**
 * Client-side id for an optimistic row. Distinct enough that a component
 * can tell "not yet saved" from a real server id.
 */
export function optimisticId(): string {
  return `optimistic-${new Date().toISOString()}`;
}
