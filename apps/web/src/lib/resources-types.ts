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
   * Clinical trust metadata. Surfaced on the article page so pediatricians
   * can audit what Tokō publishes to the families they follow.
   */
  lastReviewedAt?: string; // ISO date (YYYY-MM-DD)
  reviewer?: string; // "Dr. X, pédopsychiatre — CHRU Lille"
  sourceTier?: SourceTier;
  /**
   * Contextual triggers that make this article relevant to show on the
   * dashboard. An article with `["sleep:low"]` will surface when the
   * child's recent symptom entries have sleep ≤ 3.
   */
  triggers?: ArticleTrigger[];
}
