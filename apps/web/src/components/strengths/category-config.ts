import type { StrengthCategory } from "@focusflow/validators";

export const categoryConfig: Record<
  StrengthCategory,
  {
    labelKey: string;
    fallbackEmoji: string;
    surfaceClass: string;
    badgeClass: string;
  }
> = {
  talent: {
    labelKey: "strengths.categories.talent",
    fallbackEmoji: "🌟",
    surfaceClass:
      "bg-sage-50 ring-sage-200 dark:bg-card dark:ring-sage-800",
    badgeClass:
      "bg-sage-100 text-sage-800 dark:bg-sage-900/60 dark:text-sage-100",
  },
  achievement: {
    labelKey: "strengths.categories.achievement",
    fallbackEmoji: "🏆",
    surfaceClass:
      "bg-accent-50 ring-accent-200 dark:bg-card dark:ring-accent-800",
    badgeClass:
      "bg-accent-100 text-accent-900 dark:bg-accent-900/60 dark:text-accent-100",
  },
  quality: {
    labelKey: "strengths.categories.quality",
    fallbackEmoji: "💖",
    surfaceClass:
      "bg-info-surface ring-info-border",
    badgeClass:
      "bg-background/70 text-info-foreground ring-1 ring-info-border",
  },
  progress: {
    labelKey: "strengths.categories.progress",
    fallbackEmoji: "📈",
    surfaceClass:
      "bg-success-surface ring-success-border",
    badgeClass:
      "bg-background/70 text-success-foreground ring-1 ring-success-border",
  },
};
