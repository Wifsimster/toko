import { createFileRoute } from "@tanstack/react-router";
import { FicheEnfantPage } from "./FicheEnfantPage";

export const Route = createFileRoute("/outils/fiche-enfant")({
  component: FicheEnfantPage,
});
