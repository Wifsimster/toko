import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import {
  useBarkleySteps,
  useCompleteBarkleyStep,
  useDeleteBarkleyStep,
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

function BarkleyPage() {
  const activeChildId = useUiStore((s) => s.activeChildId);

  if (!activeChildId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Programme Barkley
          </h1>
          <p className="text-muted-foreground">
            Programme d'entraînement aux habiletés parentales (PEHP)
          </p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour accéder au programme Barkley.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Programme Barkley
        </h1>
        <p className="text-muted-foreground">
          Programme d'entraînement aux habiletés parentales (PEHP)
        </p>
      </div>

      <ProgrammeTab childId={activeChildId} />
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
    <div className="space-y-4">
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
