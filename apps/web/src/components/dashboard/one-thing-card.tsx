import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Activity, ArrowRight, BookOpen, CheckCircle2, Circle, ChevronRight, Pill } from "lucide-react";
import { Mo } from "@/components/mo/mo";
import { useChildren } from "@/hooks/use-children";
import { useStats } from "@/hooks/use-stats";
import { useMedicationAdherence } from "@/hooks/use-medications";
import { useUiStore } from "@/stores/ui-store";
import { todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";

type ItemKey = "symptoms" | "journal" | "medications";

interface ChecklistItem {
  key: ItemKey;
  labelKey: string;
  done: boolean;
  icon: React.ComponentType<{ className?: string }>;
  to: "/symptoms" | "/journal" | "/medications";
}

function useDailyChecklist(childId: string): ChecklistItem[] {
  const { data: stats } = useStats(childId, "week");
  const { data: medData } = useMedicationAdherence(childId);
  const today = todayISO();

  return useMemo<ChecklistItem[]>(() => {
    const symptomsLogged = stats?.symptoms?.some((s) => s.date === today) ?? false;
    const journalWritten = stats?.latestJournalEntry?.date === today;
    const meds = medData?.medications ?? [];
    const items: ChecklistItem[] = [
      { key: "symptoms", labelKey: "dailyChecklist.symptoms", done: symptomsLogged, icon: Activity, to: "/symptoms" },
      { key: "journal", labelKey: "dailyChecklist.journal", done: journalWritten, icon: BookOpen, to: "/journal" },
    ];
    if (meds.length > 0) {
      items.push({
        key: "medications",
        labelKey: "dailyChecklist.medications",
        done: meds.every((m) => m.todayTaken === true),
        icon: Pill,
        to: "/medications",
      });
    }
    return items;
  }, [stats, medData, today]);
}

export function OneThingCard() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: children } = useChildren();
  const items = useDailyChecklist(activeChildId ?? "");

  if (!activeChildId) return null;

  const name = children?.find((c) => c.id === activeChildId)?.name ?? "";
  const next = items.find((i) => !i.done) ?? null;
  const later = items.filter((i) => i !== next);

  return (
    <section aria-labelledby="one-thing-title" className="space-y-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] p-5",
          next ? "bg-surface-mint" : "bg-surface-honey"
        )}
      >
        <Mo
          state={next ? "accueil" : "fierte"}
          size={104}
          className="absolute top-2 right-2 sm:top-3 sm:right-4"
        />
        <p aria-hidden="true" className="font-hand pr-24 text-[21px] leading-none font-semibold">
          {t("dashboard.oneThing.kicker")}
        </p>
        <h2
          id="one-thing-title"
          className="mt-1 max-w-[calc(100%-6.5rem)] text-[23px] leading-[1.15] font-extrabold tracking-[-0.02em] [overflow-wrap:anywhere]"
        >
          {next
            ? t(`dashboard.oneThing.${next.key}.title`, { name })
            : t("dashboard.oneThing.allDone.title")}
        </h2>
        <p className="mt-1.5 mb-4 max-w-[calc(100%-6.5rem)] text-sm text-muted-foreground sm:max-w-md">
          {next ? t(`dashboard.oneThing.${next.key}.body`) : t("dashboard.oneThing.allDone.body")}
        </p>
        {next && (
          <Link
            to={next.to}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-semibold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-mint sm:w-auto sm:px-8"
          >
            {t("dashboard.oneThing.cta")}
            <ArrowRight className="size-[18px]" aria-hidden="true" />
          </Link>
        )}
      </div>

      {later.length > 0 && (
        <div>
          <h3 className="mx-1 mb-2 text-[13.5px] font-semibold text-muted-foreground">
            {t("dashboard.oneThing.later")}
          </h3>
          <ul className="space-y-2">
            {later.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.to}
                  className="group flex min-h-14 items-center gap-3 rounded-[22px] bg-card px-4 py-2 text-sm ring-1 ring-foreground/10 transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring"
                >
                  {item.done ? (
                    <CheckCircle2 className="size-[18px] shrink-0 text-success-foreground" aria-hidden="true" />
                  ) : (
                    <Circle className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <item.icon className="size-4 shrink-0 text-muted-foreground" />
                  <span
                    className={cn(
                      "min-w-0 flex-1 [overflow-wrap:anywhere]",
                      item.done ? "text-muted-foreground line-through" : "font-semibold"
                    )}
                  >
                    {t(item.labelKey)}
                    {item.done && <span className="sr-only"> ({t("dashboard.oneThing.done")})</span>}
                  </span>
                  {!item.done && (
                    <ChevronRight
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
