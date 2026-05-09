import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { History, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecentActivity } from "@/components/co-parent/recent-activity";
import { useUiStore } from "@/stores/ui-store";

// Compact 5-row preview of the activity feed for the dashboard. Renders
// nothing when no child is selected — the empty-state message belongs
// to the dedicated /activity page, the dashboard already has plenty
// going on.
export function ActivityPreviewCard() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);

  if (!activeChildId) return null;

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <History className="h-4 w-4 shrink-0 text-muted-foreground" />
            <h3 className="font-heading text-sm font-semibold">
              {t("activityPage.previewTitle")}
            </h3>
          </div>
          <Link to="/activity">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              {t("activityPage.viewAll")}
              <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <RecentActivity childId={activeChildId} limit={5} />
      </CardContent>
    </Card>
  );
}
