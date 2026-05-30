import { createFileRoute } from "@tanstack/react-router";
import { PlanDeCrisePage } from "./PlanDeCrisePage";

export const Route = createFileRoute("/ressources/plan-de-crise")({
  component: PlanDeCrisePage,
});
