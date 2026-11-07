import { createFileRoute } from "@tanstack/react-router";
import { MdphPage } from "./MdphPage";

export const Route = createFileRoute("/outils/mdph")({
  component: MdphPage,
});
