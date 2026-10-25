import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./LoginPage";

export type LoginSearch = {
  mode?: "register";
  // Set by the email-verification link (lib/auth.ts on the API): the
  // address is confirmed, the parent now signs in with their password.
  verified?: true;
  // Added by Better Auth when that link is expired or invalid.
  error?: string;
};

export const Route = createFileRoute("/login")({
  // Signup CTAs link here with ?mode=register so a first-time parent lands
  // on the account-creation form instead of the sign-in one.
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    ...(search.mode === "register" ? { mode: "register" as const } : {}),
    ...(search.verified === 1 || search.verified === "1" || search.verified === true
      ? { verified: true as const }
      : {}),
    ...(typeof search.error === "string" && search.error ? { error: search.error } : {}),
  }),
  component: LoginPage,
});
