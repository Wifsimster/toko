import { createFileRoute } from "@tanstack/react-router";
import { RoutinePage } from "./RoutinePage";

export const Route = createFileRoute("/outils/routine")({
  component: RoutinePage,
});
