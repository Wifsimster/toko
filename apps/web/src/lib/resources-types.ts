import type { ReactNode } from "react";

export type FeatureTarget =
  | "crisis-list"
  | "barkley"
  | "rewards"
  | "symptoms"
  | "journal"
  | "dashboard";

export interface FaqItem {
  question: string;
  answer: string;
}

export type ArticleAudience = "parent" | "entourage";

export type ArticleTrigger =
  | "sleep:low"
  | "focus:low"
  | "mood:low"
  | "agitation:high"
  | "impulse:high"
  | "routines:broken"
  | "crisis:recent"
  | "mood-trend:down"
  | "consistency:low";

export type SourceTier =
  | "peer-reviewed"
  | "guideline"
  | "expert-consensus"
  | "educational";

export const ARTICLE_SUBJECTS = [
  "Connaissance TDAH",
  "Guide de gestion Barkley",
  "Ressources pour les parents",
  "Parcours de diagnostic en France",
  "Parcours de soin en France",
  "Ressources pour l'entourage",
] as const;

export type ArticleSubject = (typeof ARTICLE_SUBJECTS)[number];

export interface ArticleCoverImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  video?: { webm?: string; mp4?: string };
}

export interface ResourceArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  cluster: string;
  readTime: string;
  ctaLabel: string;
  ctaTarget: FeatureTarget;
  content: ReactNode;
  related: string[];
  featured?: boolean;
  faq?: FaqItem[];
  audience?: ArticleAudience;
  cover?: ArticleCoverImage;
  lastReviewedAt?: string;
  reviewer?: string;
  sourceTier?: SourceTier;
  publishedAt?: string;
  triggers?: ArticleTrigger[];
}

export const DEFAULT_LAST_REVIEWED = "2026-02-01";
export const DEFAULT_REVIEWER = "Équipe Tokō — sources Barkley, HAS, INSERM";

export const NEW_ARTICLE_DAYS = 21;

export function isNewArticle(
  article: Pick<ResourceArticle, "publishedAt">,
  now: Date = new Date()
): boolean {
  if (!article.publishedAt) return false;
  const published = Date.parse(`${article.publishedAt}T00:00:00Z`);
  if (Number.isNaN(published)) return false;
  const ageInDays = (now.getTime() - published) / 86_400_000;
  return ageInDays <= NEW_ARTICLE_DAYS;
}

export function sortByRecency<T extends Pick<ResourceArticle, "publishedAt">>(
  articlesInDeclarationOrder: readonly T[]
): T[] {
  return articlesInDeclarationOrder
    .map((article, index) => ({ article, index }))
    .sort((a, b) => {
      const dateA = a.article.publishedAt;
      const dateB = b.article.publishedAt;
      if (dateA && dateB && dateA !== dateB) return dateB.localeCompare(dateA);
      if (dateA && !dateB) return -1;
      if (!dateA && dateB) return 1;
      return b.index - a.index;
    })
    .map((entry) => entry.article);
}
