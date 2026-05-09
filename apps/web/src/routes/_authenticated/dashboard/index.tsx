import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pill, HandHeart, Sparkles } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";

const DashboardPage = lazy(() => import("./dashboard-page"));

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardRoute,
  staticData: {
    crumb: "nav.dashboard",
    quickActions: [
      { to: "/medications", labelKey: "nav.medications", icon: Pill },
      { to: "/crisis-list", labelKey: "nav.crisisList", icon: HandHeart },
      { to: "/strengths", labelKey: "nav.strengths", icon: Sparkles },
    ],
  },
});

function DashboardRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardPage />
    </Suspense>
  );
}
