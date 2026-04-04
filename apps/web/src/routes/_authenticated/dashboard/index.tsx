import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Flame, Calendar, SmilePlus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { AddChildForm } from "@/components/shared/add-child-form";
import { useChildren } from "@/hooks/use-children";
import { useStats, type StatsPeriod } from "@/hooks/use-stats";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
});

const moodLabels = ["", "Difficile", "Moyen", "Bien", "Super"];

function DashboardPage() {
  const { data: children, isLoading } = useChildren();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const { data: stats } = useStats(activeChildId ?? "", period);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") {
      toast.success("Abonnement active avec succes !");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (isLoading) {
    return (
      <PageLoader />
    );
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

  const streakLabel = stats ? `${stats.streak}` : "—";

  const moodLabel = stats?.latestMoodRating
    ? moodLabels[stats.latestMoodRating] ?? "—"
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble du suivi quotidien
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <WeeklyChart
          data={stats?.symptoms}
          period={period}
          onPeriodChange={setPeriod}
        />
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
