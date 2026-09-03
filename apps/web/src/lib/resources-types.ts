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

/**
 * Signals extracted from recent child data that an article addresses.
 * Used by the dashboard's contextual recommendation hint.
 *
 * Convention: `{dimension}:{polarity}` where polarity is "low" / "high"
 * on the 0-10 symptom scale, or a domain tag like `crisis` / `mood-trend-down`.
 */
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

/**
 * Subjects used to group articles on the public /ressources page and the
 * authenticated /connaissances page. Order here is the display order on
 * those pages.
 */
export const ARTICLE_SUBJECTS = [
  "Connaissance TDAH",
  "Guide de gestion Barkley",
  "Ressources pour les parents",
  "Parcours de diagnostic en France",
  "Parcours de soin en France",
  "Ressources pour l'entourage",
] as const;

export type ArticleSubject = (typeof ARTICLE_SUBJECTS)[number];

/**
 * Illustration de couverture d'un article, servie depuis `public/articles/`.
 * `width` / `height` sont les dimensions intrinsèques du fichier : elles
 * réservent la place avant le chargement et évitent tout saut de mise en page.
 */
export interface ArticleCoverImage {
  src: string;
  alt: string;
  width: number;
  height: number;
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
  /**
   * Target audience. "parent" = written for the parent using Tokō.
   * "entourage" = family-friendly, suitable to share with grandparents,
   * co-parent, godparents, teachers, friends. Both appear publicly,
   * but entourage articles are suggested first in the share dialog.
   */
  audience?: ArticleAudience;
  /**
   * Illustration de couverture affichée en tête d'article. Optionnelle : un
   * article sans couverture démarre directement sur son titre.
   */
  cover?: ArticleCoverImage;
  /**
   * Clinical trust metadata. Surfaced on the article page so pediatricians
   * can audit what Tokō publishes to the families they follow.
   */
  lastReviewedAt?: string; // ISO date (YYYY-MM-DD)
  reviewer?: string; // "Dr. X, pédopsychiatre — CHRU Lille"
  sourceTier?: SourceTier;
  /**
   * Publication date (ISO YYYY-MM-DD). Drives the discreet « Nouveau »
   * marker on the dashboard hint and in the knowledge base. Optional: an
   * article without it is simply never marked as new.
   */
  publishedAt?: string;
  /**
   * Contextual triggers that make this article relevant to show on the
   * dashboard. An article with `["sleep:low"]` will surface when the
   * child's recent symptom entries have sleep ≤ 3.
   */
  triggers?: ArticleTrigger[];
}

// Default metadata applied to articles that don't override. When we begin
// shipping articles authored by external clinicians, each article declares
// its own reviewer + lastReviewedAt.
export const DEFAULT_LAST_REVIEWED = "2026-02-01";
export const DEFAULT_REVIEWER = "Équipe Tokō — sources Barkley, HAS, INSERM";

/**
 * How long a freshly published article stays marked as new. Deliberately
 * short: the marker has to disappear on its own, without the parent having
 * to acknowledge anything.
 */
export const NEW_ARTICLE_DAYS = 21;

/**
 * True while `publishedAt` is less than NEW_ARTICLE_DAYS old. A date in the
 * future also counts as new, so an article can be written ahead of time.
 */
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

/**
 * Orders articles most recent first.
 *
 * `publishedAt` decides whenever both articles carry one. Articles written
 * before we started dating them have no `publishedAt`: they come after the
 * dated ones and keep the reverse of their declaration order in
 * `resources-data.tsx`, which is maintained oldest-first (a new article is
 * appended at the end of the list). No date is ever invented — an undated
 * article simply never claims to be newer than a dated one.
 *
 * The input must be in declaration order; filtering `articles` preserves it.
 */
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
