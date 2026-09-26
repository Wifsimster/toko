import { createFileRoute } from "@tanstack/react-router";
import { QuizHome } from "@/components/quiz/quiz-home";

export type QuizHomeSearch = { pour?: "moi" | "enfant" };

export const Route = createFileRoute("/quiz/")({
  // `?pour=enfant` keeps the "for whom" step in the URL: the phone's back
  // button returns to the list, and the link can be shared as is.
  validateSearch: (search: Record<string, unknown>): QuizHomeSearch => ({
    pour: search.pour === "moi" || search.pour === "enfant" ? search.pour : undefined,
  }),
  component: QuizHome,
});
