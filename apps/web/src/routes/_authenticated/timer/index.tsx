import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Sparkles, Award, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { VisualTimer } from "@/components/timer/visual-timer";

export const Route = createFileRoute("/_authenticated/timer/")({
  component: TimerPage,
  staticData: {
    crumb: "nav.timer",
    quickActions: [
      { to: "/strengths", labelKey: "nav.strengths", icon: Sparkles },
      { to: "/achievements", labelKey: "nav.achievements", icon: Award },
      { to: "/rewards", labelKey: "nav.rewards", icon: Trophy },
    ],
  },
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
