import { createFileRoute } from "@tanstack/react-router";
import { LexiquePage } from "./LexiquePage";

export const Route = createFileRoute("/ressources/lexique")({
  component: LexiquePage,
});
