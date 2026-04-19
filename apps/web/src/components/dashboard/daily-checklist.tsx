import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Activity,
  BookOpen,
  Pill,
  CheckCircle2,
  Circle,
  ChevronRight,
  PartyPopper,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats } from "@/hooks/use-stats";
import { useMedicationAdherence } from "@/hooks/use-medications";
import { useUiStore } from "@/stores/ui-store";
import { todayISO } from "@/lib/date";

interface ChecklistItem {
  key: string;
  labelKey: string;
  done: boolean;
  icon: React.ComponentType<{ className?: string }>;
  to: "/symptoms" | "/journal" | "/medications";
}

export function DailyChecklist() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: stats } = useStats(activeChildId ?? "", "week");
  const { data: medData } = useMedicationAdherence(activeChildId ?? "");

  const today = todayISO();

  const items = useMemo<ChecklistItem[]>(() => {
    const symptomsLogged =
      stats?.symptoms?.some((s) => s.date === today) ?? false;
    const journalWritten = stats?.latestJournalEntry?.date === today;

    const meds = medData?.medications ?? [];
    const hasMeds = meds.length > 0;
    const medsAllTaken =
      hasMeds && meds.every((m) => m.todayTaken === true);

    const result: ChecklistItem[] = [
      {
        key: "symptoms",
        labelKey: "dailyChecklist.symptoms",
        done: symptomsLogged,
        icon: Activity,
        to: "/symptoms",
      },
      {
        key: "journal",
        labelKey: "dailyChecklist.journal",
        done: journalWritten,
        icon: BookOpen,
        to: "/journal",
      },
    ];

    if (hasMeds) {
      result.push({
        key: "medications",
        labelKey: "dailyChecklist.medications",
        done: medsAllTaken,
        icon: Pill,
        to: "/medications",
      });
    }

    return result;
  }, [stats, medData, today]);

  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  if (!activeChildId) return null;

  return (
    <Card className={allDone ? "border-status-success/40 bg-status-success/5" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {allDone ? (
              <PartyPopper className="h-4 w-4 text-status-success" />
            ) : (
              <span className="text-sm font-semibold text-primary">
                {doneCount}/{items.length}
              </span>
            )}
            {allDone
              ? t("dailyChecklist.allDone")
              : t("dailyChecklist.title")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent group"
          >
            {item.done ? (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-status-success" />
            ) : (
              <Circle className="h-4.5 w-4.5 shrink-0 text-muted-foreground/40" />
            )}
            <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span
              className={
                item.done
                  ? "flex-1 text-muted-foreground line-through"
                  : "flex-1 font-medium"
              }
            >
              {t(item.labelKey)}
            </span>
            {!item.done && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
