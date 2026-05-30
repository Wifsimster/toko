import { createFileRoute } from "@tanstack/react-router";
import { ConfidentialitePage } from "./ConfidentialitePage";

export const Route = createFileRoute("/confidentialite")({
  component: ConfidentialitePage,
});
