import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Timer, Sparkles } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";

const RoutinesPage = lazy(() => import("./routines-page"));

export const Route = createFileRoute("/_authenticated/routines/")({
  component: RoutinesRoute,
  staticData: {
    crumb: "nav.routines",
    quickActions: [
      { to: "/rewards", labelKey: "nav.rewards", icon: Trophy },
      { to: "/timer", labelKey: "nav.timer", icon: Timer },
      { to: "/strengths", labelKey: "nav.strengths", icon: Sparkles },
    ],
  },
});

function RoutinesRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RoutinesPage />
    </Suspense>
  );
}
