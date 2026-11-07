import {
  articleStatuses,
  countUnseenArticles,
  type ArticleRead,
  type ArticleReadStatus,
  type ArticleReadsResponse,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { api } from "../lib/api";
import { ARTICLE_DEFAULT_REVIEWED, articleDates } from "../lib/knowledge-dates";

const KEY = ["article-reads"] as const;

export function useArticleReads() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<ArticleReadsResponse>("/article-reads"),
    staleTime: 5 * 60_000,
  });
}

export function useArticleStatuses(): ReadonlyMap<string, ArticleReadStatus> | undefined {
  const { data } = useArticleReads();
  return useMemo(
    () => (data ? articleStatuses(articleDates, data, ARTICLE_DEFAULT_REVIEWED) : undefined),
    [data],
  );
}

export function useUnseenArticleCount(): number {
  const statuses = useArticleStatuses();
  return statuses ? countUnseenArticles(statuses) : 0;
}

export function useMarkArticleRead() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (slug: string) => api.post<ArticleRead>("/article-reads", { slug }),
    onSuccess: (read) => {
      queryClient.setQueryData<ArticleReadsResponse>(KEY, (current) =>
        current ? { ...current, reads: [...current.reads.filter((r) => r.slug !== read.slug), read] } : current,
      );
    },
  });
  return useCallback((slug: string) => mutate(slug), [mutate]);
}
