import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { BadgeCelebration } from "@/components/dashboard/badge-celebration";
import { useAchievements } from "@/hooks/use-achievements";
import {
  ACHIEVEMENTS,
  type AchievementId,
  type Achievement,
} from "@/lib/achievements-data";
import { cn } from "@/lib/utils";

const SEEN_KEY = "toko:achievements:seen";

function readSeen(): Set<AchievementId> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr as AchievementId[]);
  } catch {
    return new Set();
  }
}

function writeSeen(ids: Set<AchievementId>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage may be unavailable in private mode — silently skip.
  }
}

export const Route = createFileRoute("/_authenticated/achievements/")({
  component: AchievementsPage,
  staticData: { crumb: "nav.achievements" },
});

const TONE_CLASSES: Record<
  Achievement["tone"],
  { unlockedSurface: string; badgeClass: string }
> = {
  warmth: {
    unlockedSurface:
      "bg-accent-50 ring-2 ring-accent-300 dark:bg-accent-900/30 dark:ring-accent-700",
    badgeClass:
      "bg-accent-100 text-accent-900 dark:bg-accent-900/60 dark:text-accent-100",
  },
  growth: {
    unlockedSurface:
      "bg-sage-50 ring-2 ring-sage-300 dark:bg-sage-900/30 dark:ring-sage-700",
    badgeClass:
      "bg-sage-100 text-sage-800 dark:bg-sage-900/60 dark:text-sage-100",
  },
  trust: {
    unlockedSurface:
      "bg-info-surface ring-2 ring-info-border",
    badgeClass: "bg-background/70 text-info-foreground ring-1 ring-info-border",
  },
};

function AchievementsPage() {
  const { t } = useTranslation();
  const { unlocked, total } = useAchievements();
  const unlockedCount = unlocked.size;
  const pct = Math.round((unlockedCount / total) * 100);
  const [celebrate, setCelebrate] = useState(false);

  // On first render of this page, compare currently-unlocked vs the
  // localStorage "seen" set. New unlocks fire one toast each and a
  // single confetti burst, then we mark everything currently unlocked
  // as seen so the next visit is silent.
  useEffect(() => {
    const seen = readSeen();
    const newly = [...unlocked].filter((id) => !seen.has(id));
    if (newly.length === 0) return;
    setCelebrate(true);
    newly.forEach((id) => {
      toast.success(t("achievements.unlockedToast"), {
        description: t(`achievements.badges.${id}.title` satisfies BadgeKey),
      });
    });
    writeSeen(unlocked);
    // Reset the trigger flag a tick later so re-renders don't re-fire.
    const reset = setTimeout(() => setCelebrate(false), 50);
    return () => clearTimeout(reset);
  }, [unlocked, t]);

  return (
    <div className="space-y-6">
      <BadgeCelebration trigger={celebrate} />
      <PageHeader
        title={t("achievements.title")}
        description={t("achievements.subtitle")}
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="font-heading text-base font-semibold">
              {t("achievements.progressLabel", {
                done: unlockedCount,
                total,
              })}
            </p>
            <span className="font-heading text-2xl font-semibold tabular-nums text-primary">
              {pct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background ring-1 ring-primary/10">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
              aria-hidden="true"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("achievements.disclaimer")}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => (
          <BadgeCard key={a.id} badge={a} unlocked={unlocked.has(a.id)} />
        ))}
      </div>
    </div>
  );
}

function BadgeCard({
  badge,
  unlocked,
}: {
  badge: Achievement;
  unlocked: boolean;
}) {
  const { t } = useTranslation();
  const tone = TONE_CLASSES[badge.tone];

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        unlocked
          ? `${tone.unlockedSurface} border-transparent`
          : "border-dashed bg-muted/30",
      )}
    >
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "text-4xl leading-none transition-all duration-300",
              !unlocked && "opacity-40 grayscale",
            )}
            aria-hidden="true"
          >
            {badge.emoji}
          </span>
          {unlocked ? (
            <Badge className={`${tone.badgeClass} border-transparent`}>
              {t("achievements.unlocked")}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" />
              {t("achievements.locked")}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p
            className={cn(
              "font-heading text-base font-semibold leading-snug",
              !unlocked && "text-muted-foreground",
            )}
          >
            {t(`achievements.badges.${badge.id}.title` satisfies BadgeKey)}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(`achievements.badges.${badge.id}.description` satisfies BadgeKey)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Hint to make the dynamic key well-typed at the call sites above.
type BadgeKey =
  | `achievements.badges.${AchievementId}.title`
  | `achievements.badges.${AchievementId}.description`;
