import { createFileRoute } from "@tanstack/react-router";
import { OutilsPage } from "./OutilsPage";

export const Route = createFileRoute("/outils/")({
  component: OutilsPage,
});
