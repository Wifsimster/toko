import { createFileRoute, redirect } from "@tanstack/react-router";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { isQuestionnaireId, type QuestionnaireId } from "@/lib/screening/questionnaires";

export const Route = createFileRoute("/quiz/$id")({
  beforeLoad: ({ params }) => {
    if (!isQuestionnaireId(params.id)) throw redirect({ to: "/quiz" });
  },
  component: QuizQuestionnairePage,
});

function QuizQuestionnairePage() {
  const { id } = Route.useParams();
  // `key` resets the runner state when switching questionnaire in place.
  return <QuizRunner key={id} id={id as QuestionnaireId} />;
}
