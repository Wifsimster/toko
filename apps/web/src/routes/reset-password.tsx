import { createFileRoute, redirect } from "@tanstack/react-router";
import { ResetPasswordPage } from "./ResetPasswordPage";

type ResetPasswordSearch = { token: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => {
    // Trim so a whitespace-only token (e.g. `?token=%20`) is treated as
    // absent and redirected, not rendered as a form that fails on submit.
    const token =
      typeof search.token === "string" ? search.token.trim() : "";
    return { token };
  },
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({ to: "/login" });
    }
  },
  component: ResetPasswordPage,
});
