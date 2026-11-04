import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageLoader } from "@/components/ui/page-loader";

const GardenPage = lazy(() => import("./garden-page"));

export const Route = createFileRoute("/_authenticated/jardin/")({
  component: GardenRoute,
  staticData: {
    crumb: "nav.garden",
  },
});

function GardenRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <GardenPage />
    </Suspense>
  );
}
