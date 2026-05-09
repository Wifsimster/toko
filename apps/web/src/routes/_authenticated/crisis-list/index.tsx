import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Activity, Pill } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { parseNewDialogSearch } from "@/lib/route-search";

const CrisisListPage = lazy(() => import("./crisis-list-page"));

export const Route = createFileRoute("/_authenticated/crisis-list/")({
  component: CrisisListRoute,
  validateSearch: parseNewDialogSearch,
  staticData: {
    crumb: "nav.crisisList",
    quickActions: [
      { to: "/journal", labelKey: "nav.journal", icon: BookOpen, search: { new: true } },
      { to: "/symptoms", labelKey: "nav.symptoms", icon: Activity, search: { new: true } },
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
