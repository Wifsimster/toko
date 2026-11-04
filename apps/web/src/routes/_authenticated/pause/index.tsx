import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageLoader } from "@/components/ui/page-loader";

const PausePage = lazy(() => import("./pause-page"));

export const Route = createFileRoute("/_authenticated/pause/")({
  component: PauseRoute,
  staticData: {
    crumb: "nav.pause",
  },
});

function PauseRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PausePage />
    </Suspense>
  );
}
