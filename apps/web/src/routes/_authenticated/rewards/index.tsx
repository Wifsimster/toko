import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/shared/empty-state";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/page-header";
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
        <EmptyState title={t("rewards.selectChild")} />
      </div>
    );
  }

  return <RewardBoard childId={activeChildId} />;
}
