import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Activity, Pill } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";

const CrisisListPage = lazy(() => import("./crisis-list-page"));

export const Route = createFileRoute("/_authenticated/crisis-list/")({
  component: CrisisListRoute,
  staticData: {
    crumb: "nav.crisisList",
    quickActions: [
      { to: "/journal", labelKey: "nav.journal", icon: BookOpen },
      { to: "/symptoms", labelKey: "nav.symptoms", icon: Activity },
      { to: "/medications", labelKey: "nav.medications", icon: Pill },
    ],
  },
});

function CrisisListRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CrisisListPage />
    </Suspense>
  );
}
