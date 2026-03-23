import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  useBarkleySteps,
  useCompleteBarkleyStep,
  useDeleteBarkleyStep,
  useBarkleyLogs,
  useCreateBarkleyBehavior,
  useDeleteBarkleyBehavior,
  useToggleBarkleyLog,
} from "@/hooks/use-barkley";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/_authenticated/barkley/")({
  component: BarkleyPage,
});

const BARKLEY_STEPS = [
  { number: 1, title: "Pourquoi mon enfant se comporte-t-il ainsi ?" },
  { number: 2, title: "Accordez une attention positive à votre enfant" },
  { number: 3, title: "Augmenter la compliance : les ordres efficaces" },
  {
    number: 4,
    title: "Apprenez à votre enfant à ne pas interrompre vos activités",
  },
  {
    number: 5,
    title: "Mettez en place un système de jetons à la maison",
  },
  { number: 6, title: "Utiliser le retrait de privilèges" },
  { number: 7, title: "Le temps de pause (time-out)" },
  { number: 8, title: "Gérer les comportements en dehors de la maison" },
  { number: 9, title: "Gérer les problèmes futurs de comportement" },
  { number: 10, title: "Bilan et maintien des acquis" },
];

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0] as string;
}

function formatWeekLabel(monday: Date): string {
  return `Semaine du ${monday.getDate()} ${monday.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
}

function BarkleyPage() {
  const activeChildId = useUiStore((s) => s.activeChildId);

  if (!activeChildId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tableau Barkley
          </h1>
          <p className="text-muted-foreground">
            Programme d'entraînement aux habiletés parentales (PEHP)
          </p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour accéder au tableau Barkley.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau Barkley</h1>
        <p className="text-muted-foreground">
          Programme d'entraînement aux habiletés parentales (PEHP)
        </p>
      </div>

      <Tabs defaultValue="programme">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="programme">Programme</TabsTrigger>
          <TabsTrigger value="jetons">Tableau de jetons</TabsTrigger>
        </TabsList>
        <TabsContent value="programme">
          <ProgrammeTab childId={activeChildId} />
        </TabsContent>
        <TabsContent value="jetons">
          <TokenBoardTab childId={activeChildId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Programme Tab ────────────────────────────────────────

function ProgrammeTab({ childId }: { childId: string }) {
  const { data: steps, isLoading } = useBarkleySteps(childId);
  const completeStep = useCompleteBarkleyStep();
  const deleteStep = useDeleteBarkleyStep();

  const completedSteps = useMemo(() => {
    const map = new Map<number, { id: string; completedAt: string | null; notes: string | null }>();
    steps?.forEach((s) =>
      map.set(s.stepNumber, {
        id: s.id,
        completedAt: s.completedAt ?? null,
        notes: s.notes ?? null,
      })
    );
    return map;
  }, [steps]);

  const completedCount = completedSteps.size;
  const progressValue = (completedCount / 10) * 100;

  const handleToggle = (stepNumber: number) => {
    const existing = completedSteps.get(stepNumber);
    if (existing) {
      deleteStep.mutate({ id: existing.id, childId });
    } else {
      completeStep.mutate({ childId, stepNumber });
    }
  };

  if (isLoading) {
    return (
      <PageLoader />
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <Card>
        <CardContent className="py-4">
          <Progress value={progressValue}>
            <ProgressLabel>Progression</ProgressLabel>
            <ProgressValue>
              {() => `${completedCount} / 10 étapes`}
            </ProgressValue>
          </Progress>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {BARKLEY_STEPS.map((step) => {
          const completed = completedSteps.get(step.number);
          const isCompleted = !!completed;

          return (
            <Card
              key={step.number}
              className={isCompleted ? "border-primary/20 bg-primary/5" : ""}
            >
              <CardContent className="flex items-center gap-4 py-3">
                <button
                  onClick={() => handleToggle(step.number)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                  disabled={
                    completeStep.isPending || deleteStep.isPending
                  }
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">
                      {step.number}
                    </span>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    Étape {step.number} — {step.title}
                  </p>
                  {isCompleted && completed.completedAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Complétée le{" "}
                      {new Date(completed.completedAt).toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Token Board Tab ──────────────────────────────────────

function TokenBoardTab({ childId }: { childId: string }) {
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);

  const week = formatDate(currentMonday);
  const { data, isLoading } = useBarkleyLogs(childId, week);
  const toggleLog = useToggleBarkleyLog();
  const deleteBehavior = useDeleteBarkleyBehavior();

  const behaviors = data?.behaviors?.filter((b) => b.active) ?? [];
  const logs = data?.logs ?? [];

  // Build a lookup: behaviorId -> date -> completed
  const logMap = useMemo(() => {
    const map = new Map<string, Map<string, boolean>>();
    logs.forEach((l) => {
      if (!map.has(l.behaviorId)) map.set(l.behaviorId, new Map());
      map.get(l.behaviorId)!.set(l.date, l.completed);
    });
    return map;
  }, [logs]);

  // Get dates for the week
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentMonday);
      d.setDate(d.getDate() + i);
      return formatDate(d);
    });
  }, [currentMonday]);

  const isChecked = (behaviorId: string, date: string) =>
    logMap.get(behaviorId)?.get(date) ?? false;

  const handleToggle = (behaviorId: string, date: string) => {
    const current = isChecked(behaviorId, date);
    toggleLog.mutate({
      behaviorId,
      date,
      completed: !current,
      childId,
      week,
    });
  };

  const handlePrevWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() - 7);
    setCurrentMonday(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 7);
    setCurrentMonday(d);
  };

  const weeklyTotal = useMemo(() => {
    let total = 0;
    behaviors.forEach((b) => {
      weekDates.forEach((date) => {
        if (isChecked(b.id, date)) total += b.points;
      });
    });
    return total;
  }, [behaviors, weekDates, logMap]);

  if (isLoading) {
    return (
      <PageLoader />
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{formatWeekLabel(currentMonday)}</span>
        <Button variant="ghost" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {behaviors.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground space-y-4">
            <p>
              Aucun comportement défini. Ajoutez des comportements à suivre
              pour commencer le tableau de jetons.
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un comportement
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nouveau comportement</DialogTitle>
                </DialogHeader>
                <BehaviorForm
                  childId={childId}
                  onSuccess={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nouveau comportement</DialogTitle>
                </DialogHeader>
                <BehaviorForm
                  childId={childId}
                  onSuccess={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Comportement</TableHead>
                  {weekDates.map((date, i) => (
                    <TableHead key={date} className="text-center w-12">
                      <div className="text-xs">{DAY_LABELS[i]}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(date + "T00:00:00").getDate()}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center w-16">Pts</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {behaviors.map((behavior) => {
                  const weekPoints = weekDates.reduce(
                    (sum, date) =>
                      sum + (isChecked(behavior.id, date) ? behavior.points : 0),
                    0
                  );

                  return (
                    <TableRow key={behavior.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {behavior.icon && (
                            <span className="text-base">{behavior.icon}</span>
                          )}
                          <span className="text-sm font-medium">
                            {behavior.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {behavior.points} pt{behavior.points > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </TableCell>
                      {weekDates.map((date) => {
                        const checked = isChecked(behavior.id, date);
                        return (
                          <TableCell key={date} className="text-center">
                            <button
                              onClick={() => handleToggle(behavior.id, date)}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                                checked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/30 hover:border-primary/50"
                              }`}
                              disabled={toggleLog.isPending}
                            >
                              {checked && <Check className="h-3.5 w-3.5" />}
                            </button>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold tabular-nums">
                          {weekPoints}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            deleteBehavior.mutate({
                              id: behavior.id,
                              childId,
                            })
                          }
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          disabled={deleteBehavior.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-right font-medium"
                  >
                    Total de la semaine
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-bold tabular-nums text-primary">
                      {weeklyTotal}
                    </span>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Behavior Form ────────────────────────────────────────

function BehaviorForm({
  childId,
  onSuccess,
}: {
  childId: string;
  onSuccess: () => void;
}) {
  const createBehavior = useCreateBarkleyBehavior();
  const [name, setName] = useState("");
  const [points, setPoints] = useState("1");
  const [icon, setIcon] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBehavior.mutate(
      {
        childId,
        name,
        points: parseInt(points, 10) || 1,
        icon: icon || undefined,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="beh-name">Nom du comportement</Label>
        <Input
          id="beh-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Ranger sa chambre"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="beh-points">Points</Label>
          <Input
            id="beh-points"
            type="number"
            min="1"
            max="100"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="beh-icon">Icône (emoji)</Label>
          <Input
            id="beh-icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Ex: ⭐"
            maxLength={10}
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={!name || createBehavior.isPending}
      >
        {createBehavior.isPending ? "Enregistrement..." : "Ajouter"}
      </Button>
    </form>
  );
}
