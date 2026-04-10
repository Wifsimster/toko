import { cva } from "class-variance-authority";

export const quizAnswerClasses = cva(
  "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
  {
    variants: {
      state: {
        idle: "border-border hover:border-primary/40 hover:bg-muted/50 cursor-pointer",
        selected: "border-primary bg-primary/5 cursor-pointer",
        correct: "border-success-border bg-success-surface text-success-foreground cursor-default",
        wrong: "border-danger-border bg-danger-surface text-danger-foreground cursor-default",
      },
    },
    defaultVariants: {
      state: "idle",
    },
  },
);

export const quizFeedbackClasses = cva("rounded-lg border px-3 py-2 text-sm", {
  variants: {
    status: {
      correct: "border-success-border bg-success-surface text-success-foreground",
      wrong: "border-warning-border bg-warning-surface text-warning-foreground",
    },
  },
});

export type QuizAnswerState = "idle" | "selected" | "correct" | "wrong";

export function resolveAnswerState({
  isCorrect,
  isWrong,
  isSelected,
  isThisCorrect,
}: {
  isCorrect: boolean;
  isWrong: boolean;
  isSelected: boolean;
  isThisCorrect: boolean;
}): QuizAnswerState {
  if ((isCorrect && isSelected) || (isWrong && isThisCorrect)) return "correct";
  if (isWrong && isSelected) return "wrong";
  if (isSelected) return "selected";
  return "idle";
}
