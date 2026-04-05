import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { MoodLogger } from "@/components/dashboard/mood-logger";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { CorrelationInsight } from "@/components/dashboard/correlation-insight";
import { MedicationQuickLog } from "@/components/dashboard/medication-quick-log";
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

function moodLabelFor(score: number | null): string {
  if (score === null) return "—";
  if (score <= 3) return "Difficile";
  if (score <= 5) return "Moyen";
  if (score <= 7) return "Bien";
  return "Super";
}

function DashboardPage() {
  const { data: children, isLoading } = useChildren();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const { data: stats } = useStats(activeChildId ?? "", period);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") {
      toast.success("Abonnement activé avec succès !");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!children?.length) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="text-xl font-bold sm:text-2xl">Bienvenue sur Tokō</h1>
        <p className="mt-2 text-muted-foreground">
          Commencez par ajouter votre enfant pour démarrer le suivi.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="mt-6">
                <Plus className="mr-1.5 h-4 w-4" />
                Ajouter un enfant
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter votre enfant</DialogTitle>
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
  const moodLabel = moodLabelFor(stats?.latestMood ?? null);

  const showInactiveAlert =
    stats && stats.daysSinceLastEntry !== null && stats.daysSinceLastEntry >= 3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble du suivi quotidien
        </p>
      </div>

      {showInactiveAlert && (
        <InactivityAlert days={stats!.daysSinceLastEntry!} />
      )}

      <FeatureTip feature="dashboard" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Constance"
          value={consistencyLabel}
          subtitle="sur 100 — suivi + stabilité"
          icon={Target}
          color={consistencyColor}
        />
        <KpiCard
          title="Étoiles cette semaine"
          value={starsLabel}
          subtitle="comportements validés"
          icon={Star}
          color="text-amber-500"
        />
        <KpiCard
          title="Humeur"
          value={moodLabel}
          subtitle="dernier relevé"
          icon={SmilePlus}
          color="text-status-danger"
          trend={stats?.moodTrend ?? null}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MoodLogger />
        <WeeklyChart
          data={stats?.symptoms}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>

      {activeChildId && <MedicationQuickLog childId={activeChildId} />}

      {activeChildId && <CorrelationInsight childId={activeChildId} />}

      {stats?.latestJournalEntry && (
        <LatestJournalCard entry={stats.latestJournalEntry} />
      )}
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
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: "up" | "down" | "stable" | null;
}) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : trend === "stable" ? Minus : null;
  const trendColor =
    trend === "up"
      ? "text-status-success"
      : trend === "down"
        ? "text-status-danger"
        : "text-muted-foreground";
  const trendLabel =
    trend === "up" ? "en hausse" : trend === "down" ? "en baisse" : trend === "stable" ? "stable" : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {TrendIcon && trendLabel && (
            <span
              className={`flex items-center gap-1 text-xs ${trendColor}`}
              aria-label={`Tendance ${trendLabel}`}
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
}

function InactivityAlert({ days }: { days: number }) {
  return (
    <Card className="border-status-warning/40 bg-status-warning/5">
      <CardContent className="flex items-start gap-3 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
        <div className="flex-1 text-sm">
          <p className="font-medium">
            {days === 3
              ? "3 jours sans relevé"
              : `${days} jours sans relevé`}
          </p>
          <p className="text-muted-foreground">
            Pensez à enregistrer les symptômes du jour pour conserver votre série.
          </p>
        </div>
        <Link to="/symptoms">
          <Button size="sm" variant="outline">
            Ajouter
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function LatestJournalCard({ entry }: { entry: LatestJournalEntry }) {
  const date = new Date(entry.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          Dernière note du journal
        </CardTitle>
        <Link to="/journal">
          <Button size="sm" variant="ghost">
            Voir tout
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
                {tagConfig[tag as JournalTag]?.label ?? tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
