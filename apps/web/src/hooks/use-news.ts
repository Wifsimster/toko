import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { News } from "@focusflow/validators";

export const newsKeys = {
  all: ["news"] as const,
  detail: (slug: string) => ["news", slug] as const,
};

export function useNews() {
  return useQuery({
    queryKey: newsKeys.all,
    queryFn: () => api.get<News[]>("/news"),
  });
}

export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: newsKeys.detail(slug),
    queryFn: () => api.get<News>(`/news/${slug}`),
    enabled: !!slug,
  });
}
