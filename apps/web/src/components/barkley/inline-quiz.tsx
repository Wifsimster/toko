import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    BARKLEY_QUIZZES,
    shuffleQuestionOptions,
    type QuizQuestion,
} from "@/lib/barkley-quizzes";
import { BARKLEY_QUIZZES_EN } from "@/lib/barkley-quizzes.en";

const QUIZ_STORAGE_PREFIX = "barkley:quiz:inline:";

type AnswerStatus = "pending" | "correct" | "wrong";
interface Answer {
    selected: number;
    status: AnswerStatus;
}

type InlineQuizProps = {
    stepNumber: number;
    onPass: () => void;
    isPending: boolean;
    isError: boolean;
    isAlreadyCompleted: boolean;
};

export function InlineQuiz({
    stepNumber,
    onPass,
    isPending,
    isError,
    isAlreadyCompleted,
}: InlineQuizProps) {
    const { t, i18n } = useTranslation();
    const quizzes =
        i18n.resolvedLanguage === "en" ? BARKLEY_QUIZZES_EN : BARKLEY_QUIZZES;
    const questions = quizzes[stepNumber];
    const [started, setStarted] = useState(false);
    const [answers, setAnswers] = useState<Record<string, Answer>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffleSeed, setShuffleSeed] = useState(0);
    const firedPassRef = useRef(false);

    const storageKey = `${QUIZ_STORAGE_PREFIX}${stepNumber}`;

    const shuffled = useMemo(() => {
        if (!questions) return {};
        const map: Record<string, { options: string[]; correctIndex: number }> = {};
        for (const q of questions) {
            map[q.id] = shuffleQuestionOptions(q);
        }
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questions, shuffleSeed]);

    // Hydrate from sessionStorage on mount
    useEffect(() => {
        if (!questions) return;
        try {
            const raw = sessionStorage.getItem(storageKey);
            if (raw) {
                const correctIds: string[] = JSON.parse(raw);
                if (correctIds.length > 0) {
                    const restored: Record<string, Answer> = {};
                    for (const id of correctIds) {
                        restored[id] = { selected: -1, status: "correct" };
                    }
                    setAnswers(restored);
                    setStarted(true);
                }
            }
        } catch {
            // ignore
        }
    }, [questions, storageKey]);

    const currentQuestion = questions?.[currentIndex];
    const currentAnswer = currentQuestion
        ? answers[currentQuestion.id]
        : undefined;
    const currentShuffled = currentQuestion
        ? shuffled[currentQuestion.id]
        : undefined;

    const pendingIndices = useMemo(() => {
        if (!questions) return [];
        return questions
            .map((q, i) => ({ id: q.id, i }))
            .filter(({ id }) => !answers[id] || answers[id]!.status !== "correct")
            .map(({ i }) => i);
    }, [questions, answers]);

    const allCorrect =
        questions !== undefined &&
        questions.length > 0 &&
        pendingIndices.length === 0;

    // Persist progress
    useEffect(() => {
        if (!started) return;
        const correctIds = Object.entries(answers)
            .filter(([, a]) => a.status === "correct")
            .map(([id]) => id);
        try {
            if (correctIds.length > 0) {
                sessionStorage.setItem(storageKey, JSON.stringify(correctIds));
            } else {
                sessionStorage.removeItem(storageKey);
            }
        } catch {
            // ignore
        }
    }, [answers, started, storageKey]);

    // Fire onPass once all correct
    useEffect(() => {
        if (allCorrect && started && !firedPassRef.current) {
            firedPassRef.current = true;
            try {
                sessionStorage.removeItem(storageKey);
            } catch {
                // ignore
            }
            onPass();
        }
    }, [allCorrect, started, onPass, storageKey]);

    const handleSelect = (optionIndex: number) => {
        if (
            !currentQuestion ||
            !currentShuffled ||
            currentAnswer?.status === "correct"
        )
            return;
        const isCorrect = optionIndex === currentShuffled.correctIndex;
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: {
                selected: optionIndex,
                status: isCorrect ? "correct" : "wrong",
            },
        }));
    };

    const goNext = useCallback(() => {
        if (!questions) return;
        const remaining = pendingIndices.filter((i) => i > currentIndex);
        if (remaining.length > 0) {
            setCurrentIndex(remaining[0]!);
            return;
        }
        if (pendingIndices.length > 0) {
            setCurrentIndex(pendingIndices[0]!);
        }
    }, [questions, pendingIndices, currentIndex]);

    const handleTryAgain = () => {
        if (!currentQuestion) return;
        setAnswers((prev) => {
            const next = { ...prev };
            delete next[currentQuestion.id];
            return next;
        });
    };

    const handleStart = () => {
        setStarted(true);
        setShuffleSeed((s) => s + 1);
        firedPassRef.current = false;
        setCurrentIndex(0);
        setAnswers({});
    };

    if (!questions) return null;

    const correctCount = Object.values(answers).filter(
        (a) => a.status === "correct",
    ).length;
    const progress = (correctCount / questions.length) * 100;

    if (isAlreadyCompleted) {
        return (
            <Card className="border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20">
                <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                            {t("barkley.formation.quizCompleted")}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            {t("barkley.formation.quizCompletedDesc")}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!started) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-base font-semibold">
                            {t("barkley.formation.quizReady")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t("barkley.formation.quizReadyDesc", {
                                count: questions.length,
                            })}
                        </p>
                    </div>
                    <Button onClick={handleStart} size="lg" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        {t("barkley.launchQuiz")}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="space-y-4 py-4">
                {/* Progress */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            {t("barkley.questionOf", {
                                current: currentIndex + 1,
                                total: questions.length,
                            })}
                        </span>
                        <span className="tabular-nums">
                            {t("barkley.correctAnswers", {
                                correct: correctCount,
                                total: questions.length,
                            })}
                        </span>
                    </div>
                    <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-valuenow={correctCount}
                        aria-valuemax={questions.length}
                        aria-label={t("barkley.quizProgress")}
                    >
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {allCorrect ? (
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <PartyPopper className="size-7 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-heading text-lg font-semibold">
                                {isPending
                                    ? t("barkley.savingEllipsis")
                                    : isError
                                        ? t("barkley.almost")
                                        : t("barkley.stepValidatedShort")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {isError
                                    ? t("barkley.saveErrorBody")
                                    : t("barkley.allCorrect")}
                            </p>
                        </div>
                        {isError && (
                            <Button onClick={onPass} disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {t("barkley.savingDots")}
                                    </>
                                ) : (
                                    t("barkley.retrySave")
                                )}
                            </Button>
                        )}
                    </div>
                ) : currentQuestion && currentShuffled ? (
                    <>
                        <QuestionBlock
                            question={currentQuestion}
                            displayOptions={currentShuffled.options}
                            displayCorrectIndex={currentShuffled.correctIndex}
                            answer={currentAnswer}
                            onSelect={handleSelect}
                        />
                        <div className="flex justify-end">
                            {currentAnswer?.status === "correct" ? (
                                <Button onClick={goNext} size="sm">
                                    {t("barkley.nextQuestion")}
                                </Button>
                            ) : currentAnswer?.status === "wrong" ? (
                                <Button onClick={handleTryAgain} variant="outline" size="sm">
                                    {t("barkley.retryQuestion")}
                                </Button>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    {t("barkley.selectAnswer")}
                                </p>
                            )}
                        </div>
                    </>
                ) : null}

                {isError && !allCorrect && (
                    <div
                        className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                        role="alert"
                    >
                        {t("barkley.errorOccurred")}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Question block ─────────────────────────────────────

function QuestionBlock({
    question,
    displayOptions,
    displayCorrectIndex,
    answer,
    onSelect,
}: {
    question: QuizQuestion;
    displayOptions: string[];
    displayCorrectIndex: number;
    answer: Answer | undefined;
    onSelect: (optionIndex: number) => void;
}) {
    const { t } = useTranslation();
    const isAnswered = answer !== undefined;
    const isWrong = answer?.status === "wrong";
    const isCorrect = answer?.status === "correct";

    return (
        <div className="space-y-3" aria-live="polite">
            <p className="text-base font-medium leading-relaxed">
                {question.question}
            </p>
            <fieldset className="space-y-2">
                {displayOptions.map((option, oIndex) => {
                    const isSelected = answer?.selected === oIndex;
                    const isThisCorrect = oIndex === displayCorrectIndex;
                    const showGreen =
                        (isCorrect && isSelected) || (isWrong && isThisCorrect);
                    const showRed = isWrong && isSelected;

                    return (
                        <button
                            key={oIndex}
                            type="button"
                            onClick={() => onSelect(oIndex)}
                            disabled={isCorrect}
                            aria-pressed={isSelected}
                            className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${showGreen
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"
                                    : showRed
                                        ? "border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200"
                                        : isSelected
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                                } ${isCorrect ? "cursor-default" : "cursor-pointer"}`}
                        >
                            <span
                                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium"
                                aria-hidden="true"
                            >
                                {showGreen ? (
                                    <Check className="size-3" />
                                ) : showRed ? (
                                    <X className="size-3" />
                                ) : (
                                    oIndex + 1
                                )}
                            </span>
                            <span className="flex-1">{option}</span>
                        </button>
                    );
                })}
            </fieldset>
            {isAnswered && (
                <div
                    className={`rounded-lg border px-3 py-2 text-sm ${isCorrect
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200"
                            : "border-amber-200 bg-amber-50/50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200"
                        }`}
                >
                    <p className="font-medium">
                        {isCorrect ? t("barkley.correct") : t("barkley.wrong")}
                    </p>
                    <p className="mt-0.5 text-xs opacity-90">{question.explanation}</p>
                </div>
            )}
        </div>
    );
}
