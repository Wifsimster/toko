import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageLoader } from "@/components/ui/page-loader";

const DashboardPage = lazy(() => import("./dashboard-page"));

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardRoute,
  staticData: { crumb: "nav.dashboard" },
});

function DashboardRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardPage />
    </Suspense>
  );
}
