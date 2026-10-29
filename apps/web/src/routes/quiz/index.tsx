import { createFileRoute } from "@tanstack/react-router";
import { QuizHome } from "@/components/quiz/quiz-home";

export type QuizHomeSearch = { pour?: "moi" | "enfant" };

export const Route = createFileRoute("/quiz/")({
  validateSearch: (search: Record<string, unknown>): QuizHomeSearch => ({
    pour: search.pour === "moi" || search.pour === "enfant" ? search.pour : undefined,
  }),
  component: QuizHome,
});
