import { createFileRoute, redirect } from "@tanstack/react-router";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import type { ParcoursId } from "@/lib/screening/parcours";

export const Route = createFileRoute("/quiz/$id")({
  // Imported on demand so the questionnaires ship with the quiz chunk only.
  beforeLoad: async ({ params }) => {
    const { isParcoursId } = await import("@/lib/screening/parcours");
    if (!isParcoursId(params.id)) throw redirect({ to: "/quiz" });
  },
  component: QuizParcoursPage,
});

function QuizParcoursPage() {
  const { id } = Route.useParams();
  // `key` resets the runner state when switching questionnaire in place.
  return <QuizRunner key={id} id={id as ParcoursId} />;
}
