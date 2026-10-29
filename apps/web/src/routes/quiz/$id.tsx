import { createFileRoute, redirect } from "@tanstack/react-router";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import type { ParcoursId } from "@/lib/screening/parcours";

export const Route = createFileRoute("/quiz/$id")({
  beforeLoad: async ({ params }) => {
    const { isParcoursId } = await import("@/lib/screening/parcours");
    if (!isParcoursId(params.id)) throw redirect({ to: "/quiz" });
  },
  component: QuizParcoursPage,
});

function QuizParcoursPage() {
  const { id } = Route.useParams();
  return <QuizRunner key={id} id={id as ParcoursId} />;
}
