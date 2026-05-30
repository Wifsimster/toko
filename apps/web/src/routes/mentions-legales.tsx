import { createFileRoute } from "@tanstack/react-router";
import { MentionsLegalesPage } from "./MentionsLegalesPage";

export const Route = createFileRoute("/mentions-legales")({
  component: MentionsLegalesPage,
});
