import { createFileRoute } from "@tanstack/react-router";
import { TarifsPage } from "./TarifsPage";

export const Route = createFileRoute("/tarifs")({
  component: TarifsPage,
});
