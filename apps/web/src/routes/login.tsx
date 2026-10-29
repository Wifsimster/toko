import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./LoginPage";

export type LoginSearch = {
  mode?: "register";
  verified?: true;
  error?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    ...(search.mode === "register" ? { mode: "register" as const } : {}),
    ...(search.verified === 1 || search.verified === "1" || search.verified === true
      ? { verified: true as const }
      : {}),
    ...(typeof search.error === "string" && search.error ? { error: search.error } : {}),
  }),
  component: LoginPage,
});
