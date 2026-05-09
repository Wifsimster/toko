import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, Activity as ActivityIcon, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { RecentActivity } from "@/components/co-parent/recent-activity";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/_authenticated/activity/")({
  component: ActivityPage,
  staticData: {
    crumb: "nav.activity",
    quickActions: [
      { to: "/journal", labelKey: "nav.journal", icon: BookOpen, search: { new: true } },
      { to: "/symptoms", labelKey: "nav.symptoms", icon: ActivityIcon, search: { new: true } },
      { to: "/achievements", labelKey: "nav.achievements", icon: Award },
    ],
  },
});

function ActivityPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("activityPage.title")}
        description={t("activityPage.subtitle")}
      />

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("activityPage.selectChild")}
          </CardContent>
        </Card>
      ) : (
        <RecentActivity childId={activeChildId} limit={100} />
      )}
    </div>
  );
}
