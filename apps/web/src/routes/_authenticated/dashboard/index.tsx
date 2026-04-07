import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Target,
  Star,
  SmilePlus,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { DailyChecklist } from "@/components/dashboard/daily-checklist";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { MoodLogger } from "@/components/dashboard/mood-logger";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { CorrelationInsight } from "@/components/dashboard/correlation-insight";
import { MedicationQuickLog } from "@/components/dashboard/medication-quick-log";
import { BarkleyProgressCard } from "@/components/dashboard/barkley-progress-card";
import { ResourceHintCard } from "@/components/dashboard/resource-hint-card";
import { AddChildForm } from "@/components/shared/add-child-form";
import { useChildren } from "@/hooks/use-children";
import { useStats, type StatsPeriod, type LatestJournalEntry } from "@/hooks/use-stats";
import { useUiStore } from "@/stores/ui-store";
import { tagConfig } from "@/components/journal/journal-card";
import { FeatureTip } from "@/components/shared/feature-tip";
import type { JournalTag } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
});

// Map a 0-10 mood score (from symptoms) to one of the 4 translation keys.
function moodLabelKeyFor(score: number | null): string | null {
  if (score === null) return null;
  if (score <= 3) return "dashboard.moodLabels.difficult";
  if (score <= 5) return "dashboard.moodLabels.average";
  if (score <= 7) return "dashboard.moodLabels.good";
  return "dashboard.moodLabels.great";
}

function DashboardPage() {
  const { t } = useTranslation();
  const moodLoggerRef = useRef<HTMLDivElement>(null);

  const scrollToMoodLogger = () => {
    moodLoggerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };
  const { data: children, isLoading } = useChildren();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const { data: stats } = useStats(activeChildId ?? "", period);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") {
      toast.success(t("dashboard.billingSuccess"));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [t]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!children?.length) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="text-xl font-bold sm:text-2xl">
          {t("dashboard.welcome")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("dashboard.welcomeSubtitle")}
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="mt-6">
                <Plus className="mr-1.5 h-4 w-4" />
                {t("dashboard.addChild")}
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("dashboard.addChildTitle")}</DialogTitle>
            </DialogHeader>
            <AddChildForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const consistencyLabel =
    stats?.consistencyScore !== null && stats?.consistencyScore !== undefined
      ? `${stats.consistencyScore}`
      : "—";
  const consistencyColor =
    stats?.consistencyScore === null || stats?.consistencyScore === undefined
      ? "text-muted-foreground"
      : stats.consistencyScore >= 70
        ? "text-status-success"
        : stats.consistencyScore >= 40
          ? "text-status-warning"
          : "text-status-danger";
  const starsLabel = stats ? `${stats.weeklyStars}` : "—";
  const moodKey = moodLabelKeyFor(stats?.latestMood ?? null);
  const moodLabel = moodKey ? t(moodKey) : "—";

  const showInactiveAlert =
    stats && stats.daysSinceLastEntry !== null && stats.daysSinceLastEntry >= 3;

  return (
    <div className="space-y-6">
      {/* ── Zone A: Aujourd'hui ────────────────────────────── */}
      <section aria-label={t("dashboard.todaySection")}>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        {showInactiveAlert && (
          <div className="mt-4">
            <InactivityAlert days={stats!.daysSinceLastEntry!} />
          </div>
        )}

        <div className="mt-4">
          <QuickActions />
        </div>

        <div className="mt-4">
          <DailyChecklist />
        </div>

        <FeatureTip feature="dashboard" />
      </section>

      {/* ── Zone B: Suivi rapide ──────────────────────────── */}
      <section aria-label={t("dashboard.trackingSection")} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div ref={moodLoggerRef} id="mood-logger" className="scroll-mt-20">
            <MoodLogger />
          </div>
          {activeChildId && <MedicationQuickLog childId={activeChildId} />}
        </div>
      </section>

      {/* ── Zone C: Comprendre ────────────────────────────── */}
      <section aria-label={t("dashboard.insightsSection")} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title={t("dashboard.consistency")}
            value={consistencyLabel}
            subtitle={t("dashboard.consistencySubtitle")}
            icon={Target}
            color={consistencyColor}
            to="/symptoms"
            ariaLabel={t("dashboard.consistencyAria")}
          />
          <KpiCard
            title={t("dashboard.weeklyStars")}
            value={starsLabel}
            subtitle={t("dashboard.weeklyStarsSubtitle")}
            icon={Star}
            color="text-amber-500"
            to="/rewards"
            ariaLabel={t("dashboard.weeklyStarsAria")}
          />
          <KpiCard
            title={t("dashboard.mood")}
            value={moodLabel}
            subtitle={t("dashboard.moodSubtitle")}
            icon={SmilePlus}
            color="text-status-danger"
            trend={stats?.moodTrend ?? null}
            onClick={scrollToMoodLogger}
            ariaLabel={t("dashboard.moodAria")}
          />
        </div>

        <WeeklyChart
          data={stats?.symptoms}
          period={period}
          onPeriodChange={setPeriod}
        />

        {activeChildId && <BarkleyProgressCard />}

        {activeChildId && <CorrelationInsight childId={activeChildId} />}

        {activeChildId && <ResourceHintCard childId={activeChildId} />}

        {stats?.latestJournalEntry && (
          <LatestJournalCard entry={stats.latestJournalEntry} />
        )}
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  to,
  onClick,
  ariaLabel,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: "up" | "down" | "stable" | null;
  to?: "/symptoms" | "/rewards" | "/barkley" | "/journal";
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const { t } = useTranslation();
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : trend === "stable" ? Minus : null;
  const trendColor =
    trend === "up"
      ? "text-status-success"
      : trend === "down"
        ? "text-status-danger"
        : "text-muted-foreground";
  const trendLabel =
    trend === "up"
      ? t("dashboard.trendUp")
      : trend === "down"
        ? t("dashboard.trendDown")
        : trend === "stable"
          ? t("dashboard.trendStable")
          : null;

  const isInteractive = !!to || !!onClick;
  const interactiveClass = isInteractive
    ? "group cursor-pointer transition-all hover:shadow-md hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.99]"
    : "";

  const cardInner = (
    <Card className={interactiveClass}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-1.5">
          <Icon className={`h-4 w-4 ${color}`} />
          {isInteractive && (
            <ChevronRight
              className="h-3.5 w-3.5 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {TrendIcon && trendLabel && (
            <span
              className={`flex items-center gap-1 text-xs ${trendColor}`}
              aria-label={t("dashboard.trendAria", { trend: trendLabel })}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {trendLabel}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} aria-label={ariaLabel} className="block rounded-xl">
        {cardInner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="block w-full rounded-xl text-left"
      >
        {cardInner}
      </button>
    );
  }

  return cardInner;
}

function InactivityAlert({ days }: { days: number }) {
  const { t } = useTranslation();
  return (
    <Card className="border-status-warning/40 bg-status-warning/5">
      <CardContent className="flex items-start gap-3 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
        <div className="flex-1 text-sm">
          <p className="font-medium">
            {t("dashboard.inactivity", { count: days })}
          </p>
          <p className="text-muted-foreground">
            {t("dashboard.inactivityBody")}
          </p>
        </div>
        <Link to="/symptoms">
          <Button size="sm" variant="outline">
            {t("common.add")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function LatestJournalCard({ entry }: { entry: LatestJournalEntry }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const date = new Date(entry.date).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          {t("dashboard.latestJournal")}
        </CardTitle>
        <Link to="/journal">
          <Button size="sm" variant="ghost">
            {t("common.viewAll")}
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium capitalize">{date}</span>
        </div>
        <p className="text-sm text-foreground line-clamp-3">{entry.text}</p>
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <Badge
                key={tag}
                variant={tagConfig[tag as JournalTag]?.variant ?? "secondary"}
                className="text-xs"
              >
                {tagConfig[tag as JournalTag]
                  ? t(tagConfig[tag as JournalTag]!.labelKey)
                  : tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
