import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useBarkleySteps,
  useCompleteBarkleyStep,
  useDeleteBarkleyStep,
  useBarkleyLogs,
  useCreateBarkleyBehavior,
  useDeleteBarkleyBehavior,
  useToggleBarkleyLog,
  useBarkleyRewards,
  useCreateBarkleyReward,
  useDeleteBarkleyReward,
} from "@/hooks/use-barkley";
import { useChild } from "@/hooks/use-children";
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

const BARKLEY_TIPS = [
  {
    title: "Immédiateté",
    desc: "Étoile juste après le geste",
  },
  {
    title: "Positivité",
    desc: "Jamais retirer une étoile",
  },
  {
    title: "Régularité",
    desc: "Chaque jour avec votre enfant",
  },
  {
    title: "Progressivité",
    desc: "2-3 gestes au début",
  },
  {
    title: "Valorisation",
    desc: "Un bravo à chaque étoile",
  },
];

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

      <Tabs defaultValue="jetons">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jetons">Tableau de récompenses</TabsTrigger>
          <TabsTrigger value="programme">Programme</TabsTrigger>
        </TabsList>
        <TabsContent value="jetons">
          <RewardBoard childId={activeChildId} />
        </TabsContent>
        <TabsContent value="programme">
          <ProgrammeTab childId={activeChildId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Reward Board (main visual board) ─────────────────────

function RewardBoard({ childId }: { childId: string }) {
  const [currentMonday, setCurrentMonday] = useState(() =>
    getMonday(new Date())
  );
  const [behaviorDialogOpen, setBehaviorDialogOpen] = useState(false);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);

  const { data: child } = useChild(childId);
  const week = formatDate(currentMonday);
  const { data, isLoading } = useBarkleyLogs(childId, week);
  const { data: rewards = [], isLoading: rewardsLoading } =
    useBarkleyRewards(childId);
  const toggleLog = useToggleBarkleyLog();
  const deleteBehavior = useDeleteBarkleyBehavior();
  const deleteReward = useDeleteBarkleyReward();

  const behaviors = data?.behaviors?.filter((b) => b.active) ?? [];
  const logs = data?.logs ?? [];

  const logMap = useMemo(() => {
    const map = new Map<string, Map<string, boolean>>();
    logs.forEach((l) => {
      if (!map.has(l.behaviorId)) map.set(l.behaviorId, new Map());
      map.get(l.behaviorId)!.set(l.date, l.completed);
    });
    return map;
  }, [logs]);

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

  // Count total stars for the week
  const weeklyStars = useMemo(() => {
    let total = 0;
    behaviors.forEach((b) => {
      weekDates.forEach((date) => {
        if (isChecked(b.id, date)) total++;
      });
    });
    return total;
  }, [behaviors, weekDates, logMap]);

  const maxStars = behaviors.length * 7;

  const childName = child?.name ?? "...";

  if (isLoading || rewardsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Personalized header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-6 py-5 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl"
              style={{
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 95}%`,
                transform: `rotate(${Math.random() * 40 - 20}deg)`,
                opacity: 0.4 + Math.random() * 0.6,
              }}
            >
              ⭐
            </span>
          ))}
        </div>
        <div className="relative text-center">
          <h2 className="text-2xl font-bold font-heading">
            ⭐ Le Tableau de {childName} ⭐
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevWeek}
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-white/90">
              {formatWeekLabel(currentMonday)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextWeek}
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {maxStars > 0 && (
            <p className="mt-1 text-sm text-white/80">
              {weeklyStars} / {maxStars} ⭐ cette semaine
            </p>
          )}
        </div>
      </div>

      {/* Main content: behavior grid + rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Behavior tracking grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Comportements
            </h3>
            <Dialog
              open={behaviorDialogOpen}
              onOpenChange={setBehaviorDialogOpen}
            >
              <DialogTrigger
                render={
                  <Button size="sm" variant="outline">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
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
                  onSuccess={() => setBehaviorDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {behaviors.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>
                  Ajoutez des comportements pour commencer le tableau de
                  récompenses.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-[1fr_repeat(7,_minmax(36px,_1fr))_40px] border-b bg-muted/50 px-3 py-2">
                <div className="text-xs font-medium text-muted-foreground" />
                {DAY_LABELS.map((day, i) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-muted-foreground"
                  >
                    <div>{day}</div>
                    <div className="text-[10px] text-muted-foreground/60">
                      {new Date(weekDates[i]! + "T00:00:00").getDate()}
                    </div>
                  </div>
                ))}
                <div />
              </div>

              {/* Behavior rows */}
              {behaviors.map((behavior, idx) => (
                <div
                  key={behavior.id}
                  className={`grid grid-cols-[1fr_repeat(7,_minmax(36px,_1fr))_40px] items-center px-3 py-2.5 ${
                    idx < behaviors.length - 1 ? "border-b" : ""
                  } hover:bg-muted/30 transition-colors`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">
                      {behavior.icon || "✅"}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {behavior.name}
                    </span>
                  </div>

                  {weekDates.map((date) => {
                    const checked = isChecked(behavior.id, date);
                    return (
                      <div key={date} className="flex justify-center">
                        <button
                          onClick={() => handleToggle(behavior.id, date)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                            checked
                              ? "scale-110"
                              : "hover:bg-muted/50 hover:scale-105"
                          }`}
                          disabled={toggleLog.isPending}
                          title={
                            checked
                              ? "Retirer l'étoile"
                              : "Ajouter une étoile"
                          }
                        >
                          {checked ? (
                            <span className="text-xl leading-none">⭐</span>
                          ) : (
                            <span className="text-muted-foreground/30 text-lg leading-none">
                              ☆
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  <div className="flex justify-center">
                    <button
                      onClick={() =>
                        deleteBehavior.mutate({ id: behavior.id, childId })
                      }
                      className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 rounded"
                      disabled={deleteBehavior.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Rewards sidebar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5" />
              Récompenses
            </h3>
            <Dialog
              open={rewardDialogOpen}
              onOpenChange={setRewardDialogOpen}
            >
              <DialogTrigger
                render={
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nouvelle récompense</DialogTitle>
                </DialogHeader>
                <RewardForm
                  childId={childId}
                  onSuccess={() => setRewardDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-gradient-to-b from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-200/50 dark:border-amber-800/30">
            <CardContent className="py-3 px-4">
              {rewards.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ajoutez des récompenses motivantes pour votre enfant.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {rewards.map((reward) => (
                    <li
                      key={reward.id}
                      className="group flex items-start gap-2"
                    >
                      <span className="text-base shrink-0 mt-0.5">
                        {reward.icon || "🎁"}
                      </span>
                      <span className="text-sm font-medium flex-1">
                        {reward.name}
                      </span>
                      <button
                        onClick={() =>
                          deleteReward.mutate({
                            id: reward.id,
                            childId,
                          })
                        }
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all p-0.5"
                        disabled={deleteReward.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Barkley tips */}
      <Card className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/40 dark:border-indigo-800/30">
        <CardContent className="py-3 px-4">
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            Conseils Barkley
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {BARKLEY_TIPS.map((tip) => (
              <p key={tip.title} className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/80">
                  {tip.title}
                </span>
                {" — "}
                {tip.desc}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
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
    return <PageLoader />;
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
  const [icon, setIcon] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBehavior.mutate(
      {
        childId,
        name,
        points: 1,
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
          placeholder="Ex: Je range ma chambre"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="beh-icon">Icône (emoji)</Label>
        <Input
          id="beh-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="Ex: 🧹"
          maxLength={10}
        />
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

// ─── Reward Form ──────────────────────────────────────────

function RewardForm({
  childId,
  onSuccess,
}: {
  childId: string;
  onSuccess: () => void;
}) {
  const createReward = useCreateBarkleyReward();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReward.mutate(
      {
        childId,
        name,
        icon: icon || undefined,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reward-name">Nom de la récompense</Label>
        <Input
          id="reward-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Un temps de dessin avec maman"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reward-icon">Icône (emoji)</Label>
        <Input
          id="reward-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="Ex: 🎨"
          maxLength={10}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={!name || createReward.isPending}
      >
        {createReward.isPending ? "Enregistrement..." : "Ajouter"}
      </Button>
    </form>
  );
}
