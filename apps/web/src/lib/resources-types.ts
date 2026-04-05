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
}
