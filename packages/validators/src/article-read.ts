import { z } from "zod";

export const ARTICLE_READS_START = "2026-11-07";
export const ARTICLE_NEW_GRACE_DAYS = 21;

const articleSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const markArticleReadSchema = z.object({
  slug: z.string().min(1).max(200).regex(articleSlugRegex, "Article inconnu"),
});

export const articleReadSchema = z.object({
  slug: z.string(),
  readAt: z.string().datetime(),
});

export const articleReadsResponseSchema = z.object({
  accountCreatedAt: z.string().datetime(),
  reads: z.array(articleReadSchema),
});

export type MarkArticleRead = z.infer<typeof markArticleReadSchema>;
export type ArticleRead = z.infer<typeof articleReadSchema>;
export type ArticleReadsResponse = z.infer<typeof articleReadsResponseSchema>;

export type ArticleReadStatus = "new" | "updated" | "read" | "unread";

export interface ArticleChangeDates {
  publishedAt?: string;
  lastReviewedAt?: string;
}

function isoDay(value: string): string {
  return value.slice(0, 10);
}

function shiftDay(day: string, days: number): string {
  const time = Date.parse(`${day}T00:00:00Z`) + days * 86_400_000;
  return new Date(time).toISOString().slice(0, 10);
}

export function articleChangedOn(dates: ArticleChangeDates, fallback: string): string {
  const candidates = [dates.publishedAt, dates.lastReviewedAt ?? fallback].filter(
    (day): day is string => typeof day === "string" && day.length >= 10,
  );
  return candidates.map(isoDay).reduce((a, b) => (b > a ? b : a), isoDay(fallback));
}

export function articleNewSince(accountCreatedAt: string): string {
  const created = isoDay(accountCreatedAt);
  const start = created > ARTICLE_READS_START ? created : ARTICLE_READS_START;
  return shiftDay(start, -ARTICLE_NEW_GRACE_DAYS);
}

export function articleReadStatus(
  changedOn: string,
  readAt: string | undefined,
  newSince: string,
): ArticleReadStatus {
  if (readAt) return changedOn > isoDay(readAt) ? "updated" : "read";
  return changedOn >= newSince ? "new" : "unread";
}

export function isArticleUnseen(status: ArticleReadStatus): boolean {
  return status === "new" || status === "updated";
}

export function articleStatuses(
  articles: readonly ({ slug: string } & ArticleChangeDates)[],
  data: ArticleReadsResponse,
  fallback: string,
): Map<string, ArticleReadStatus> {
  const readAtBySlug = new Map(data.reads.map((r) => [r.slug, r.readAt]));
  const newSince = articleNewSince(data.accountCreatedAt);
  return new Map(
    articles.map((article) => [
      article.slug,
      articleReadStatus(
        articleChangedOn(article, fallback),
        readAtBySlug.get(article.slug),
        newSince,
      ),
    ]),
  );
}

export function countUnseenArticles(statuses: ReadonlyMap<string, ArticleReadStatus>): number {
  let count = 0;
  for (const status of statuses.values()) if (isArticleUnseen(status)) count += 1;
  return count;
}
