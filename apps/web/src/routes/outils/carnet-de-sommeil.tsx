import { createFileRoute } from "@tanstack/react-router";
import { CarnetSommeilPage } from "./CarnetSommeilPage";

export const Route = createFileRoute("/outils/carnet-de-sommeil")({
  component: CarnetSommeilPage,
});
