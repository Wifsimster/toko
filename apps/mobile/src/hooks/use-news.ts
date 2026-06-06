import type { News } from "@focusflow/validators";
import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";

// Mirrors the published-articles list and single-article fetch from /news.
const KEY = ["news"] as const;

/** List all published articles (GET /news). */
export function useNewsList() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<News[]>("/news"),
  });
}

/** Fetch a single article by slug (GET /news/:slug). */
export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: [...KEY, slug],
    queryFn: () => api.get<News>(`/news/${slug}`),
    enabled: !!slug,
  });
}
