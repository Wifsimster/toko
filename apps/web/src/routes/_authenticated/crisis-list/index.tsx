import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageLoader } from "@/components/ui/page-loader";

const CrisisListPage = lazy(() => import("./crisis-list-page"));

export const Route = createFileRoute("/_authenticated/crisis-list/")({
  component: CrisisListRoute,
  staticData: { crumb: "nav.crisisList" },
});

function CrisisListRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CrisisListPage />
    </Suspense>
  );
}
