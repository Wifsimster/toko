import { createFileRoute } from "@tanstack/react-router";
import { FormationPage } from "./FormationPage";

export const Route = createFileRoute("/formation")({
  component: FormationPage,
});
