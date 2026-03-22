import { createFileRoute } from "@tanstack/react-router";
import { Pill, Flame, Calendar, SmilePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoodLogger } from "@/components/dashboard/mood-logger";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { useChildren } from "@/hooks/use-children";
import { useStats } from "@/hooks/use-stats";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
});

const moodLabels = ["", "Difficile", "Moyen", "Bien", "Super"];

function DashboardPage() {
  const { data: children, isLoading } = useChildren();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: stats } = useStats(activeChildId ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!children?.length) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="text-2xl font-bold">Bienvenue sur Tokō</h1>
        <p className="mt-2 text-muted-foreground">
          Commencez par ajouter votre enfant pour démarrer le suivi.
        </p>
        <Button className="mt-6">Ajouter un enfant</Button>
      </div>
    );
  }

  const medLabel = stats
    ? `${stats.medicationsTakenToday}/${stats.totalActiveMedications}`
    : "—";

  const streakLabel = stats ? `${stats.streak}` : "—";

  const moodLabel = stats?.latestMoodRating
    ? moodLabels[stats.latestMoodRating] ?? "—"
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble du suivi quotidien
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Médicaments"
          value={medLabel}
          subtitle="pris aujourd'hui"
          icon={Pill}
          color="text-status-success"
        />
        <KpiCard
          title="Série"
          value={streakLabel}
          subtitle="jours consécutifs"
          icon={Flame}
          color="text-primary"
        />
        <KpiCard
          title="Prochain RDV"
          value="—"
          subtitle="aucun planifié"
          icon={Calendar}
          color="text-status-warning"
        />
        <KpiCard
          title="Humeur"
          value={moodLabel}
          subtitle="dernière entrée"
          icon={SmilePlus}
          color="text-status-danger"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MoodLogger />
        <WeeklyChart data={stats?.weeklySymptoms} />
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
