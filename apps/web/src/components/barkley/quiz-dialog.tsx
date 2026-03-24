import { useState, useCallback } from "react";
import { Check, X, RotateCcw, Loader2 } from "lucide-react";
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
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions
    ? Object.keys(answers).length === questions.length
    : false;

  const results = submitted && questions
    ? questions.map((q) => ({
        ...q,
        selected: answers[q.id] ?? -1,
        correct: answers[q.id] === q.correctIndex,
      }))
    : null;

  const allCorrect = results ? results.every((r) => r.correct) : false;

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);

    const isPass = questions!.every(
      (q) => answers[q.id] === q.correctIndex
    );
    if (isPass) {
      onPass();
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isPending) return;
      if (!nextOpen) {
        setAnswers({});
        setSubmitted(false);
      }
      onOpenChange(nextOpen);
    },
    [isPending, onOpenChange]
  );

  if (!questions) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-lg"
        showCloseButton={!isPending}
      >
        <DialogHeader>
          <DialogTitle>
            Étape {stepNumber} — Quiz de validation
          </DialogTitle>
          <DialogDescription>{stepTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {questions.map((question, qIndex) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={qIndex}
              selected={answers[question.id] ?? -1}
              submitted={submitted}
              onSelect={(optionIndex) =>
                handleSelect(question.id, optionIndex)
              }
            />
          ))}
        </div>

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Une erreur est survenue. Vos réponses sont sauvegardées.
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={onPass}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Réessayer l'enregistrement"
              )}
            </Button>
          </div>
        )}

        <DialogFooter>
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full sm:w-auto"
            >
              Valider mes réponses
            </Button>
          ) : allCorrect ? (
            <div className="flex w-full items-center gap-2 text-sm font-medium text-emerald-600">
              <Check className="size-4" />
              {isPending
                ? "Enregistrement en cours..."
                : "Bravo ! Étape validée."}
            </div>
          ) : (
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RotateCcw className="size-4" />
              Réessayer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Question Card ──────────────────────────────────────

function QuestionCard({
  question,
  index,
  selected,
  submitted,
  onSelect,
}: {
  question: QuizQuestion;
  index: number;
  selected: number;
  submitted: boolean;
  onSelect: (optionIndex: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {index + 1}. {question.question}
      </p>
      <div className="space-y-1.5">
        {question.options.map((option, oIndex) => {
          const isSelected = selected === oIndex;
          const isCorrect = oIndex === question.correctIndex;
          const showCorrect = submitted && isCorrect;
          const showWrong = submitted && isSelected && !isCorrect;

          return (
            <button
              key={oIndex}
              type="button"
              onClick={() => onSelect(oIndex)}
              disabled={submitted}
              className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                showCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : showWrong
                    ? "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300"
                    : isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
              } ${submitted ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-xs">
                {showCorrect ? (
                  <Check className="size-3 text-emerald-600" />
                ) : showWrong ? (
                  <X className="size-3 text-red-600" />
                ) : (
                  String.fromCharCode(65 + oIndex)
                )}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {submitted && selected !== question.correctIndex && (
        <p className="ml-7 text-xs text-muted-foreground italic">
          {question.explanation}
        </p>
      )}
    </div>
  );
}
