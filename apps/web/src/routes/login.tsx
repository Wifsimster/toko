import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./LoginPage";

export type LoginSearch = { mode?: "register" };

export const Route = createFileRoute("/login")({
  // Signup CTAs link here with ?mode=register so a first-time parent lands
  // on the account-creation form instead of the sign-in one.
  validateSearch: (search: Record<string, unknown>): LoginSearch =>
    search.mode === "register" ? { mode: "register" } : {},
  component: LoginPage,
});
