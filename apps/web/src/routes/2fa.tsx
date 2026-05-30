import { createFileRoute } from "@tanstack/react-router";
import { TwoFactorChallengePage } from "./TwoFactorChallengePage";

export const Route = createFileRoute("/2fa")({
  component: TwoFactorChallengePage,
});
