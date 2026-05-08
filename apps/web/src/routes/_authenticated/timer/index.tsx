import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/page-header";
import { VisualTimer } from "@/components/timer/visual-timer";

export const Route = createFileRoute("/_authenticated/timer/")({
  component: TimerPage,
  staticData: { crumb: "nav.timer" },
});

function TimerPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <PageHeader
        title={t("timer.title")}
        description={t("timer.subtitle")}
      />
      <div className="flex justify-center pt-4">
        <VisualTimer />
      </div>
    </div>
  );
}
