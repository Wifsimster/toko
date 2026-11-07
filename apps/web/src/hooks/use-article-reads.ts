import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  articleStatuses,
  countUnseenArticles,
  type ArticleChangeDates,
  type ArticleRead,
  type ArticleReadStatus,
  type ArticleReadsResponse,
} from "@focusflow/validators";
import { api } from "@/lib/api-client";
import { DEFAULT_LAST_REVIEWED } from "@/lib/resources-types";

const articleReadsKey = ["article-reads"] as const;
const articleDatesKey = ["article-dates"] as const;

type ArticleDates = { slug: string } & ArticleChangeDates;

const NO_ARTICLES: ArticleDates[] = [];

export function useArticleReads() {
  return useQuery({
    queryKey: articleReadsKey,
    queryFn: () => api.get<ArticleReadsResponse>("/article-reads"),
    staleTime: 5 * 60_000,
  });
}

export function useArticleStatuses(
  articles: readonly ArticleDates[],
): ReadonlyMap<string, ArticleReadStatus> | undefined {
  const { data } = useArticleReads();
  return useMemo(
    () => (data ? articleStatuses(articles, data, DEFAULT_LAST_REVIEWED) : undefined),
    [articles, data],
  );
}

export function useUnseenArticleCount(): number {
  const { data: dates } = useQuery({
    queryKey: articleDatesKey,
    queryFn: async (): Promise<ArticleDates[]> => {
      const { articles } = await import("@/lib/resources-data");
      return articles.map(({ slug, publishedAt, lastReviewedAt }) => ({
        slug,
        publishedAt,
        lastReviewedAt,
      }));
    },
    staleTime: Infinity,
  });
  const statuses = useArticleStatuses(dates ?? NO_ARTICLES);
  return statuses ? countUnseenArticles(statuses) : 0;
}

export function useMarkArticleRead(slug: string) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (articleSlug: string) =>
      api.post<ArticleRead>("/article-reads", { slug: articleSlug }),
    onSuccess: (read) => {
      queryClient.setQueryData<ArticleReadsResponse>(articleReadsKey, (current) =>
        current
          ? {
              ...current,
              reads: [...current.reads.filter((r) => r.slug !== read.slug), read],
            }
          : current,
      );
    },
  });

  useEffect(() => {
    mutate(slug);
  }, [mutate, slug]);
}
