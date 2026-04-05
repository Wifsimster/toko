import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, Loader2, PartyPopper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BARKLEY_QUIZZES,
  shuffleQuestionOptions,
  type QuizQuestion,
} from "@/lib/barkley-quizzes";
import { BARKLEY_QUIZZES_EN } from "@/lib/barkley-quizzes.en";

const QUIZ_STORAGE_PREFIX = "barkley:quiz:";

type QuizDialogProps = {
  stepNumber: number;
  stepTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPass: () => void;
  isPending: boolean;
  isError: boolean;
};

type AnswerStatus = "pending" | "correct" | "wrong";

interface Answer {
  selected: number;
  status: AnswerStatus;
}

export function BarkleyQuizDialog({
  stepNumber,
  stepTitle,
  open,
  onOpenChange,
  onPass,
  isPending,
  isError,
}: QuizDialogProps) {
  const { t, i18n } = useTranslation();
  const quizzes =
    i18n.resolvedLanguage === "en" ? BARKLEY_QUIZZES_EN : BARKLEY_QUIZZES;
  const questions = quizzes[stepNumber];
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  // Bumped on each fresh open so shuffle is re-derived.
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const firedPassRef = useRef(false);

  const storageKey = `${QUIZ_STORAGE_PREFIX}${stepNumber}`;

  // Fresh shuffle of options for every question, stable for this dialog open.
  const shuffled = useMemo(() => {
    if (!questions) return {};
    const map: Record<string, { options: string[]; correctIndex: number }> = {};
    for (const q of questions) {
      map[q.id] = shuffleQuestionOptions(q);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, shuffleSeed]);

  // Hydrate from sessionStorage (or reset) when the dialog opens.
  useEffect(() => {
    if (!open) return;
    firedPassRef.current = false;
    setShuffleSeed((s) => s + 1);
    setCurrentIndex(0);
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const correctIds: string[] = JSON.parse(raw);
        const restored: Record<string, Answer> = {};
        for (const id of correctIds) {
          // selected is re-derived from the next shuffle; placeholder here.
          restored[id] = { selected: -1, status: "correct" };
        }
        setAnswers(restored);
        return;
      }
    } catch {
      // ignore corrupt storage
    }
    setAnswers({});
  }, [open, stepNumber, storageKey]);

  const currentQuestion = questions?.[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentShuffled = currentQuestion ? shuffled[currentQuestion.id] : undefined;

  // Wrong-only retry list (questions that need to be answered correctly)
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

  // Persist correct-answer ids to sessionStorage as the user progresses.
  useEffect(() => {
    if (!open) return;
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
      // ignore quota / privacy-mode errors
    }
  }, [answers, open, storageKey]);

  // Trigger onPass once when all correct, and clear persistence.
  useEffect(() => {
    if (allCorrect && !firedPassRef.current) {
      firedPassRef.current = true;
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
      onPass();
    }
  }, [allCorrect, onPass, storageKey]);

  const handleSelect = (optionIndex: number) => {
    if (!currentQuestion || !currentShuffled || currentAnswer?.status === "correct")
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
    // Find next question that is not yet correct, cycling forward
    const remaining = pendingIndices.filter((i) => i > currentIndex);
    if (remaining.length > 0) {
      setCurrentIndex(remaining[0]!);
      return;
    }
    // Wrap around to first pending question
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

  // Keyboard shortcuts: 1-4 to select, Enter to advance
  useEffect(() => {
    if (!open || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const num = parseInt(e.key, 10);
      if (
        num >= 1 &&
        currentShuffled &&
        num <= currentShuffled.options.length
      ) {
        e.preventDefault();
        handleSelect(num - 1);
      } else if (e.key === "Enter" && currentAnswer) {
        e.preventDefault();
        if (currentAnswer.status === "correct") goNext();
        else handleTryAgain();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentQuestion, currentAnswer, currentShuffled, goNext]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isPending) return;
      onOpenChange(nextOpen);
    },
    [isPending, onOpenChange]
  );

  if (!questions || !currentQuestion || !currentShuffled) return null;

  const correctCount = Object.values(answers).filter(
    (a) => a.status === "correct"
  ).length;
  const progress = (correctCount / questions.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={!isPending}
      >
        <DialogHeader>
          <DialogTitle>{t("barkley.quizTitle", { number: stepNumber })}</DialogTitle>
          <DialogDescription>{stepTitle}</DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("barkley.questionOf", { current: currentIndex + 1, total: questions.length })}
            </span>
            <span className="tabular-nums">
              {t("barkley.correctAnswers", { correct: correctCount, total: questions.length })}
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
          <SuccessScreen isPending={isPending} isError={isError} />
        ) : (
          <QuestionBlock
            question={currentQuestion}
            displayOptions={currentShuffled.options}
            displayCorrectIndex={currentShuffled.correctIndex}
            answer={currentAnswer}
            onSelect={handleSelect}
          />
        )}

        {isError && !allCorrect && (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            role="alert"
          >
            {t("barkley.errorOccurred")}
          </div>
        )}

        <DialogFooter>
          {allCorrect ? (
            isError ? (
              <Button onClick={onPass} disabled={isPending} className="w-full sm:w-auto">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t("barkley.savingDots")}
                  </>
                ) : (
                  t("barkley.retrySave")
                )}
              </Button>
            ) : (
              <div className="flex w-full items-center justify-center gap-2 text-sm font-medium text-emerald-600">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending
                  ? t("barkley.savingInProgress")
                  : t("barkley.stepValidated")}
              </div>
            )
          ) : currentAnswer?.status === "correct" ? (
            <Button onClick={goNext} className="w-full sm:w-auto">
              {t("barkley.nextQuestion")}
            </Button>
          ) : currentAnswer?.status === "wrong" ? (
            <Button
              onClick={handleTryAgain}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {t("barkley.retryQuestion")}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground sm:ml-auto">
              {t("barkley.selectAnswer")}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const isAnswered = answer !== undefined;
  const isWrong = answer?.status === "wrong";
  const isCorrect = answer?.status === "correct";

  return (
    <div className="space-y-3" aria-live="polite">
      <p className="text-base font-medium leading-relaxed">
        {question.question}
      </p>
      <div className="space-y-2">
        {displayOptions.map((option, oIndex) => {
          const isSelected = answer?.selected === oIndex;
          const isThisCorrect = oIndex === displayCorrectIndex;
          const showGreen =
            (isCorrect && isSelected) ||
            (isWrong && isThisCorrect);
          const showRed = isWrong && isSelected;

          return (
            <button
              key={oIndex}
              type="button"
              onClick={() => onSelect(oIndex)}
              disabled={isCorrect}
              aria-pressed={isSelected}
              className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                showGreen
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
      </div>
      {isAnswered && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            isCorrect
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

// ─── Success screen ─────────────────────────────────────

function SuccessScreen({ isPending, isError }: { isPending: boolean; isError: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
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
    </div>
  );
}
