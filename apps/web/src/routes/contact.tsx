import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "./ContactPage";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});
