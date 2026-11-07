import type { ArticleChangeDates } from "@focusflow/validators";

import { ARTICLE_META, knowledgeArticles } from "./knowledge";

export const ARTICLE_DEFAULT_REVIEWED = "2026-02-01";

export const articleDates: ReadonlyArray<{ slug: string } & ArticleChangeDates> = knowledgeArticles.map((a) => ({
  slug: a.slug,
  publishedAt: ARTICLE_META[a.slug]?.publishedAt,
  lastReviewedAt: ARTICLE_META[a.slug]?.lastReviewedAt,
}));
