import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Gift } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useUiStore } from "@/stores/ui-store";
import { RewardBoard } from "./reward-board";

export const Route = createFileRoute("/_authenticated/rewards/")({
  component: RewardsPage,
  staticData: {
    crumb: "nav.rewards",
  },
});

function RewardsPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);

  if (!activeChildId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("rewards.title")}
          description={t("rewards.subtitle")}
        />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Gift className="mx-auto mb-3 size-10 text-muted-foreground/50" />
            <p>{t("rewards.selectChild")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <RewardBoard childId={activeChildId} />;
}
