import type { ReactNode } from "react";

export type FeatureTarget =
  | "crisis-list"
  | "barkley"
  | "rewards"
  | "symptoms"
  | "journal"
  | "dashboard";

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
}
