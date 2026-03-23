import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pill, Flame, Calendar, SmilePlus, Plus, Shuffle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageLoader } from "@/components/ui/page-loader";
import { MoodLogger } from "@/components/dashboard/mood-logger";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { useChildren, useCreateChild } from "@/hooks/use-children";
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
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <PageLoader />
    );
  }

  if (!children?.length) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="text-2xl font-bold">Bienvenue sur Tokō</h1>
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

const RANDOM_FIRSTNAMES = [
  "Petit Loup", "Étoile", "Chouette", "Papillon", "Ourson",
  "Luciole", "Panda", "Colibri", "Renardeau", "Coccinelle",
  "Doudou", "Câlin", "Perle", "Nuage", "Soleil",
];

function getRandomFirstname() {
  return RANDOM_FIRSTNAMES[Math.floor(Math.random() * RANDOM_FIRSTNAMES.length)]!;
}

function AddChildForm({ onSuccess }: { onSuccess: () => void }) {
  const createChild = useCreateChild();
  const setActiveChild = useUiStore((s) => s.setActiveChild);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<string>("");
  const [diagnosisType, setDiagnosisType] = useState<string>("undefined");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createChild.mutate(
      {
        name,
        birthDate,
        ...(gender && { gender: gender as "male" | "female" | "other" }),
        diagnosisType: diagnosisType as "inattentive" | "hyperactive" | "mixed" | "undefined",
      },
      {
        onSuccess: (data) => {
          setActiveChild(data.id);
          onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="child-name">Prénom</Label>
        <div className="flex gap-2">
          <Input
            id="child-name"
            placeholder="Prénom de l'enfant"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setName(getRandomFirstname())}
                />
              }
            >
              <Shuffle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              Générer un surnom aléatoire pour protéger la vie privée de votre enfant
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="child-birth">Date de naissance</Label>
        <Input
          id="child-birth"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="child-gender">Genre</Label>
        <Select value={gender} onValueChange={(v) => v && setGender(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Non renseigné" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Garçon</SelectItem>
            <SelectItem value="female">Fille</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="child-diagnosis">Type de diagnostic</Label>
        <Select value={diagnosisType} onValueChange={(v) => v && setDiagnosisType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undefined">Non défini</SelectItem>
            <SelectItem value="inattentive">Inattentif</SelectItem>
            <SelectItem value="hyperactive">Hyperactif</SelectItem>
            <SelectItem value="mixed">Mixte</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={createChild.isPending}
      >
        {createChild.isPending ? "Ajout..." : "Ajouter"}
      </Button>
    </form>
  );
}
