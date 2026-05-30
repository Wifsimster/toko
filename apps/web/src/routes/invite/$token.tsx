import { createFileRoute } from "@tanstack/react-router";
import { InviteAcceptPage } from "./InviteAcceptPage";

export const Route = createFileRoute("/invite/$token")({
  component: InviteAcceptPage,
});
