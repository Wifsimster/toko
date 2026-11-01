import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/suivi/")({
  beforeLoad: () => {
    throw redirect({ to: "/journal", replace: true });
  },
  staticData: {
    crumb: "nav.journal",
  },
});
