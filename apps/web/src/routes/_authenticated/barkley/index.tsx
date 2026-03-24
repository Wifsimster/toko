import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, ExternalLink } from "lucide-react";
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
  {
    number: 1,
    title: "Pourquoi mon enfant se comporte-t-il ainsi ?",
    description:
      "Comprendre la nature du TDAH et du trouble oppositionnel avec provocation (TOP). Cette première étape pose les bases du programme en expliquant les particularités neurobiologiques de votre enfant et les raisons de ses comportements.",
    link: "https://www.tdah-france.fr/Programme-d-entrainement-aux-habiletes-parentales-de-Barkley.html",
    linkLabel: "TDAH France — Le programme Barkley",
  },
  {
    number: 2,
    title: "Accordez une attention positive à votre enfant",
    description:
      "Apprendre à créer des « moments spéciaux » de qualité avec votre enfant pour recréer le lien familial. Valoriser les comportements positifs plutôt que de focaliser sur le négatif permet de rétablir une communication sereine.",
    link: "https://www.clepsy.fr/tdah-barkley/",
    linkLabel: "CléPsy — Programme Barkley",
  },
  {
    number: 3,
    title: "Augmenter la compliance : les ordres efficaces",
    description:
      "Apprendre à formuler des demandes claires et structurées en trois temps. Cette étape enseigne comment donner des consignes que votre enfant peut comprendre et suivre, associées à une reconnaissance positive de sa coopération.",
    link: "https://www.ideereka.com/article/programme-entrainement-habiletes-parentales-barkley-en-10-etapes-clefs",
    linkLabel: "Ideereka — Les 10 étapes du programme Barkley",
  },
  {
    number: 4,
    title: "Apprenez à votre enfant à ne pas interrompre vos activités",
    description:
      "Aider votre enfant à développer son autonomie et sa capacité à patienter. Cette étape vise à ce que chacun trouve sa place dans la famille, en apprenant à l'enfant à respecter les moments où vous êtes occupé.",
    link: "https://www.clepsy.fr/tdah-barkley/",
    linkLabel: "CléPsy — Programme Barkley",
  },
  {
    number: 5,
    title: "Mettez en place un système de jetons à la maison",
    description:
      "Créer un système de points, gommettes ou jetons pour récompenser les comportements attendus. Ce renforcement positif transforme les interactions quotidiennes et motive votre enfant à adopter de bons comportements de manière ludique.",
    link: "https://www.ideereka.com/article/programme-entrainement-habiletes-parentales-barkley-en-10-etapes-clefs",
    linkLabel: "Ideereka — Les 10 étapes du programme Barkley",
  },
  {
    number: 6,
    title: "Utiliser le retrait de privilèges",
    description:
      "Apprendre à utiliser le coût de la réponse de manière juste et cohérente. Lorsque l'enfant ne respecte pas les consignes, le retrait de points ou privilèges constitue une conséquence logique et proportionnée, sans recourir aux punitions traditionnelles.",
    link: "https://www.tdah-france.fr/Programme-d-entrainement-aux-habiletes-parentales-de-Barkley.html",
    linkLabel: "TDAH France — Le programme Barkley",
  },
  {
    number: 7,
    title: "Le temps de pause (time-out)",
    description:
      "Remplacer les punitions par des moments de calme structurés. Le time-out permet à l'enfant de se retrouver seul face à lui-même pour redescendre en émotion avant de reprendre la discussion de manière apaisée.",
    link: "https://www.ideereka.com/article/programme-entrainement-habiletes-parentales-barkley-en-10-etapes-clefs",
    linkLabel: "Ideereka — Les 10 étapes du programme Barkley",
  },
  {
    number: 8,
    title: "Gérer les comportements en dehors de la maison",
    description:
      "Généraliser les techniques apprises à l'extérieur : magasins, restaurants, sorties familiales. Cette étape inclut aussi la collaboration avec l'école et la mise en place d'un bulletin quotidien de comportement.",
    link: "https://www.clepsy.fr/tdah-barkley/",
    linkLabel: "CléPsy — Programme Barkley",
  },
  {
    number: 9,
    title: "Gérer les problèmes futurs de comportement",
    description:
      "Acquérir l'autonomie pour anticiper et prévenir les résurgences de comportements inadaptés. Vous apprenez à identifier les situations à risque et à préparer des stratégies adaptées avant qu'un problème ne survienne.",
    link: "https://www.ideereka.com/article/programme-entrainement-habiletes-parentales-barkley-en-10-etapes-clefs",
    linkLabel: "Ideereka — Les 10 étapes du programme Barkley",
  },
  {
    number: 10,
    title: "Bilan et maintien des acquis",
    description:
      "Faire le point sur les progrès réalisés et consolider les compétences acquises tout au long du programme. Cette dernière étape vous aide à maintenir les changements positifs dans la durée et à poursuivre en autonomie.",
    link: "https://www.has-sante.fr/jcms/p_3542493/fr/trouble-du-neurodeveloppement/-tdah-diagnostic-et-interventions-therapeutiques-aupres-des-enfants-et-adolescents-recommandations",
    linkLabel: "HAS — Recommandations TDAH",
  },
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
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

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
          const isExpanded = expandedStep === step.number;

          return (
            <Card
              key={step.number}
              className={isCompleted ? "border-primary/20 bg-primary/5" : ""}
            >
              <CardContent className="py-3">
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  role="button"
                  aria-expanded={isExpanded}
                  aria-controls={`step-detail-${step.number}`}
                  onClick={() =>
                    setExpandedStep(isExpanded ? null : step.number)
                  }
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(step.number);
                    }}
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
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <div
                  id={`step-detail-${step.number}`}
                  className={`grid transition-all duration-200 ${
                    isExpanded ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-12 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {step.linkLabel}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
