import { createFileRoute } from "@tanstack/react-router";
import { CGUPage } from "./CGUPage";

export const Route = createFileRoute("/cgu")({
  component: CGUPage,
});
