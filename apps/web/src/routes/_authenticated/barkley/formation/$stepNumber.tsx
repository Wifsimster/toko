import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { StepRenderer } from "@/components/barkley/step-renderer";
import { InlineQuiz } from "@/components/barkley/inline-quiz";
import { getStepContent } from "@/lib/barkley-content";
import {
    useBarkleySteps,
    useCompleteBarkleyStep,
} from "@/hooks/use-barkley";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute(
    "/_authenticated/barkley/formation/$stepNumber",
)({
    parseParams: (params) => ({
        stepNumber: Number(params.stepNumber),
    }),
    component: FormationStepPage,
});

function FormationStepPage() {
    const { stepNumber } = Route.useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const activeChildId = useUiStore((s) => s.activeChildId);

    const content = getStepContent(stepNumber);


    const { data: steps } = useBarkleySteps(activeChildId ?? "");
    const completeStep = useCompleteBarkleyStep();

    const isCompleted = steps?.some(
        (s) => s.stepNumber === stepNumber,
    );

    const handleQuizPass = () => {
        if (!activeChildId) return;
        completeStep.mutate(
            { childId: activeChildId, stepNumber },
            {
                onSuccess: () => {
                    // Scroll to top to see success state
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            },
        );
    };

    if (!content || stepNumber < 1 || stepNumber > 10) {
        return (
            <div className="space-y-4">
                <Link
                    to="/barkley"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t("barkley.formation.backToProgram")}
                </Link>
                <p className="text-muted-foreground">
                    {t("barkley.formation.stepNotFound")}
                </p>
            </div>
        );
    }

    if (!activeChildId) {
        return (
            <div className="space-y-4">
                <Link
                    to="/barkley"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t("barkley.formation.backToProgram")}
                </Link>
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        {t("barkley.selectChild")}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Back nav + step indicator */}
            <div className="flex items-center justify-between">
                <Link
                    to="/barkley"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t("barkley.formation.backToProgram")}
                </Link>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {t("barkley.formation.stepOf", {
                        current: stepNumber,
                        total: 10,
                    })}
                </span>
            </div>

            {/* Step title */}
            <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                    {t("barkley.formation.stepLabel", { number: stepNumber })}
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                    {content.title}
                </h1>
            </div>

            {/* Disclaimer */}
            <Callout variant="info">
                <p>{t("barkley.formation.disclaimer")}</p>
            </Callout>

            {/* Content */}
            <StepRenderer content={content} />

            {/* PEHP link */}
            <Callout variant="success" icon={MapPin}>
                <p className="font-medium">
                    {t("barkley.formation.pehpTitle")}
                </p>
                <p className="mt-0.5 text-xs opacity-90">
                    {t("barkley.formation.pehpDesc")}
                </p>
            </Callout>

            {/* Quiz section */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold tracking-tight">
                    {t("barkley.formation.quizSectionTitle")}
                </h2>
                <InlineQuiz
                    stepNumber={stepNumber}
                    onPass={handleQuizPass}
                    isPending={completeStep.isPending}
                    isError={completeStep.isError}
                    isAlreadyCompleted={!!isCompleted}
                />
            </section>

            {/* Step navigation */}
            <div className="sticky bottom-0 z-10 -mx-4 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
                <div className="flex items-center justify-between">
                    {stepNumber > 1 ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                navigate({
                                    to: "/barkley/formation/$stepNumber",
                                    params: { stepNumber: stepNumber - 1 },
                                })
                            }
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {t("barkley.formation.prevStep")}
                        </Button>
                    ) : (
                        <div />
                    )}
                    {stepNumber < 10 ? (
                        <Button
                            size="sm"
                            onClick={() =>
                                navigate({
                                    to: "/barkley/formation/$stepNumber",
                                    params: { stepNumber: stepNumber + 1 },
                                })
                            }
                        >
                            {t("barkley.formation.nextStep")}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => navigate({ to: "/barkley" })}
                        >
                            {t("barkley.formation.backToProgram")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
