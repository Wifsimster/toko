import { useTranslation } from "react-i18next";
import type { GardenDay } from "@focusflow/validators";
import { cn } from "@/lib/utils";
import { LeafIcon } from "./garden-art";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function GardenWeek({ week, today, className }: { week: GardenDay[]; today: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <ol aria-label={t("pause.garden.weekLabel")} className={cn("flex justify-between", className)}>
      {week.map((day, i) => {
        const key = DAY_KEYS[i] ?? "mon";
        const isToday = day.date === today;
        return (
          <li
            key={day.date}
            className="flex w-9 flex-col items-center gap-1.5"
            aria-label={t(day.leaf ? "pause.garden.dayWithLeaf" : "pause.garden.dayWithout", {
              day: t(`pause.garden.days.${key}`),
            })}
          >
            <span aria-hidden="true" className="text-xs font-semibold text-muted-foreground">
              {t(`pause.garden.daysShort.${key}`)}
            </span>
            {day.leaf ? (
              <LeafIcon className="size-6 text-foreground" />
            ) : (
              <span
                aria-hidden="true"
                className={cn(
                  "block size-5 rounded-full",
                  isToday ? "border-2 border-dashed border-brand bg-card" : "bg-muted",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
