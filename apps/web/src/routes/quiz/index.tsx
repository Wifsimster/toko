import { createFileRoute } from "@tanstack/react-router";
import { QuizHome } from "@/components/quiz/quiz-home";

export const Route = createFileRoute("/quiz/")({
  component: QuizHome,
});
