import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageLoader } from "@/components/ui/page-loader";

const RoutinesPage = lazy(() => import("./routines-page"));

export const Route = createFileRoute("/_authenticated/routines/")({
  component: RoutinesRoute,
  staticData: { crumb: "nav.routines" },
});

function RoutinesRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RoutinesPage />
    </Suspense>
  );
}
