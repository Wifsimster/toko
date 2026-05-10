import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/page-header";
import { VisualTimer } from "@/components/timer/visual-timer";

type TimerSearch = {
  duration?: number;
  autostart?: boolean;
  label?: string;
};

export const Route = createFileRoute("/_authenticated/timer/")({
  component: TimerPage,
  staticData: {
    crumb: "nav.timer",
  },
  // Accept deep-link params from Routines: ?duration=20&autostart=1&label=...
  // Invalid values are ignored so a stale URL never breaks the page.
  validateSearch: (raw: Record<string, unknown>): TimerSearch => {
    const out: TimerSearch = {};
    const d = Number(raw.duration);
    if (Number.isFinite(d) && d > 0 && d <= 180) out.duration = Math.round(d);
    if (raw.autostart === true || raw.autostart === "1" || raw.autostart === "true") {
      out.autostart = true;
    }
    if (typeof raw.label === "string" && raw.label.trim().length > 0) {
      out.label = raw.label.trim().slice(0, 80);
    }
    return out;
  },
});

function TimerPage() {
  const { t } = useTranslation();
  const { duration, autostart, label } = Route.useSearch();
  const fromRoutine = !!(duration && autostart);

  return (
    <div className="space-y-8">
      {!fromRoutine && (
        <PageHeader
          title={t("timer.title")}
          description={t("timer.subtitle")}
        />
      )}
      <div className="flex justify-center pt-4">
        <VisualTimer
          initialMinutes={duration}
          autostart={autostart}
          label={label}
        />
      </div>
    </div>
  );
}
