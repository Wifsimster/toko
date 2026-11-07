import { createFileRoute } from "@tanstack/react-router";
import { PreparerRdvPage } from "./PreparerRdvPage";

export const Route = createFileRoute("/outils/preparer-rendez-vous")({
  component: PreparerRdvPage,
});
