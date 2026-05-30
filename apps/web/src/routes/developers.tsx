import { createFileRoute } from "@tanstack/react-router";
import { DevelopersPage } from "./DevelopersPage";

export const Route = createFileRoute("/developers")({
  component: DevelopersPage,
});
