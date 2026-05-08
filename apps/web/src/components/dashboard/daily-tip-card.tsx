import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Lightbulb, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { articles } from "@/lib/resources-data";

type DailyEntry =
  | { kind: "tip"; key: string }
  | { kind: "article"; slug: string };

// Mix of short evergreen tips (i18n keys under dashboard.dailyTip.tips.*)
// and rotating article suggestions. Rotation is deterministic by day of
// year so the value is stable within the day and predictable across visits.
const ENTRIES: DailyEntry[] = [
  { kind: "tip", key: "selfCompassion" },
  { kind: "tip", key: "smallWins" },
  { kind: "article", slug: "crise-tdah-enfant-guide-complet" },
  { kind: "tip", key: "coRegulation" },
  { kind: "tip", key: "predictableRoutine" },
  { kind: "article", slug: "apres-le-diagnostic-tdah-parcours-de-soins" },
  { kind: "tip", key: "namingEmotions" },
  { kind: "tip", key: "shortInstructions" },
  { kind: "tip", key: "celebrate" },
  { kind: "article", slug: "co-regulation-parent-enfant-tdah" },
  { kind: "tip", key: "yourSleep" },
  { kind: "tip", key: "askForHelp" },
  { kind: "tip", key: "transitionWarning" },
  { kind: "article", slug: "dysregulation-emotionnelle-tdah" },
  { kind: "tip", key: "physicalRelease" },
];

function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export function DailyTipCard() {
  const { t } = useTranslation();

  const entry = useMemo(() => {
    const idx = dayOfYear() % ENTRIES.length;
    return ENTRIES[idx]!;
  }, []);

  if (entry.kind === "article") {
    const article = articles.find((a) => a.slug === entry.slug);
    if (!article) return <TipBody tipKey="selfCompassion" />;
    return (
      <Card className="border-info-border bg-info-surface">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/70 text-info-foreground">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-info-foreground/80">
              {t("dashboard.dailyTip.articleEyebrow")}
            </p>
            <p className="font-heading text-base font-semibold leading-snug text-foreground">
              {article.title}
            </p>
            <p className="text-xs text-muted-foreground">{article.readTime}</p>
          </div>
          <Link
            to="/ressources/$slug"
            params={{ slug: article.slug }}
            className="shrink-0"
          >
            <Button size="sm" variant="outline" className="gap-1.5">
              {t("dashboard.dailyTip.read")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <TipBody tipKey={entry.key} />;
}

function TipBody({ tipKey }: { tipKey: string }) {
  const { t } = useTranslation();
  return (
    <Card className="border-accent-200 bg-accent-50/60 dark:bg-accent-900/20 dark:border-accent-800">
      <CardContent className="flex items-start gap-3 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/70 text-accent-700 dark:text-accent-200">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-700/80 dark:text-accent-300/80">
            {t("dashboard.dailyTip.tipEyebrow")}
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {t(`dashboard.dailyTip.tips.${tipKey}`)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
