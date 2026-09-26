import { createFileRoute, redirect } from "@tanstack/react-router";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { isParcoursId, type ParcoursId } from "@/lib/screening/parcours";

export const Route = createFileRoute("/quiz/$id")({
  beforeLoad: ({ params }) => {
    if (!isParcoursId(params.id)) throw redirect({ to: "/quiz" });
  },
  component: QuizParcoursPage,
});

function QuizParcoursPage() {
  const { id } = Route.useParams();
  // `key` resets the runner state when switching questionnaire in place.
  return <QuizRunner key={id} id={id as ParcoursId} />;
}
