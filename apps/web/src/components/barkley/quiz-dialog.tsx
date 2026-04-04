import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { BARKLEY_QUIZZES, type QuizQuestion } from "@/lib/barkley-quizzes";

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
  const questions = BARKLEY_QUIZZES[stepNumber];
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const firedPassRef = useRef(false);

  const resetQuiz = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    firedPassRef.current = false;
  }, []);

  // Reset when dialog opens fresh (not closed mid-loading)
  useEffect(() => {
    if (open) {
      resetQuiz();
    }
  }, [open, stepNumber, resetQuiz]);

  const currentQuestion = questions?.[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

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

  // Trigger onPass once when all correct
  useEffect(() => {
    if (allCorrect && !firedPassRef.current) {
      firedPassRef.current = true;
      onPass();
    }
  }, [allCorrect, onPass]);

  const handleSelect = (optionIndex: number) => {
    if (!currentQuestion || currentAnswer?.status === "correct") return;
    const isCorrect = optionIndex === currentQuestion.correctIndex;
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
      if (num >= 1 && num <= currentQuestion.options.length) {
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
  }, [open, currentQuestion, currentAnswer, goNext]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isPending) return;
      onOpenChange(nextOpen);
    },
    [isPending, onOpenChange]
  );

  if (!questions || !currentQuestion) return null;

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
          <DialogTitle>Étape {stepNumber} — Quiz de validation</DialogTitle>
          <DialogDescription>{stepTitle}</DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Question {currentIndex + 1} sur {questions.length}
            </span>
            <span className="tabular-nums">
              {correctCount}/{questions.length} bonnes réponses
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={correctCount}
            aria-valuemax={questions.length}
            aria-label="Progression du quiz"
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
            answer={currentAnswer}
            onSelect={handleSelect}
          />
        )}

        {isError && !allCorrect && (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            role="alert"
          >
            Une erreur est survenue.
          </div>
        )}

        <DialogFooter>
          {allCorrect ? (
            isError ? (
              <Button onClick={onPass} disabled={isPending} className="w-full sm:w-auto">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Réessayer l'enregistrement"
                )}
              </Button>
            ) : (
              <div className="flex w-full items-center justify-center gap-2 text-sm font-medium text-emerald-600">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending
                  ? "Enregistrement en cours..."
                  : "Bravo ! Étape validée."}
              </div>
            )
          ) : currentAnswer?.status === "correct" ? (
            <Button onClick={goNext} className="w-full sm:w-auto">
              Question suivante
            </Button>
          ) : currentAnswer?.status === "wrong" ? (
            <Button
              onClick={handleTryAgain}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Réessayer cette question
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground sm:ml-auto">
              Sélectionnez une réponse
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
  answer,
  onSelect,
}: {
  question: QuizQuestion;
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
        {question.options.map((option, oIndex) => {
          const isSelected = answer?.selected === oIndex;
          const isThisCorrect = oIndex === question.correctIndex;
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
            {isCorrect ? "Bonne réponse" : "Pas tout à fait"}
          </p>
          <p className="mt-0.5 text-xs opacity-90">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Success screen ─────────────────────────────────────

function SuccessScreen({ isPending, isError }: { isPending: boolean; isError: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <PartyPopper className="size-7 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <p className="font-heading text-lg font-semibold">
          {isPending
            ? "Enregistrement…"
            : isError
              ? "Presque !"
              : "Étape validée"}
        </p>
        <p className="text-sm text-muted-foreground">
          {isError
            ? "Un problème d'enregistrement, réessayez ci-dessous."
            : "Toutes les réponses sont correctes. Bravo !"}
        </p>
      </div>
    </div>
  );
}
