import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ROUTINE_TEMPLATES,
  type RoutineTemplate,
} from "@focusflow/validators";

/** Ready-made routines a parent can adopt in one tap. */

const TEMPLATES_INITIAL_VISIBLE = 5;

export function TemplatesList({
  onPick,
  disabled,
  initiallyExpanded = false,
}: {
  onPick: (template: RoutineTemplate) => void;
  disabled?: boolean;
  initiallyExpanded?: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(() => initiallyExpanded);

  const visible = expanded
    ? ROUTINE_TEMPLATES
    : ROUTINE_TEMPLATES.slice(0, TEMPLATES_INITIAL_VISIBLE);
  const hasMore = ROUTINE_TEMPLATES.length > TEMPLATES_INITIAL_VISIBLE;

  const dayShort = [
    t("days.monShort"),
    t("days.tueShort"),
    t("days.wedShort"),
    t("days.thuShort"),
    t("days.friShort"),
    t("days.satShort"),
    t("days.sunShort"),
  ];
  const formatDays = (days: number[] | undefined) => {
    if (!days || days.length === 0 || days.length === 7) return null;
    return days
      .toSorted((a, b) => a - b)
      .map((d) => dayShort[d])
      .join(" · ");
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {visible.map((template) => {
          const stepCount = template.steps.length;
          const totalMinutes = template.steps.reduce(
            (acc, s) => acc + (s.durationMinutes ?? 0),
            0,
          );
          const gentle = template.tone === "gentle";
          const daysLabel = formatDays(template.daysOfWeek);
          return (
            <li key={template.key}>
              <button
                type="button"
                onClick={() => onPick(template)}
                disabled={disabled}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors min-h-[64px] ${
                  gentle
                    ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-accent"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background text-2xl shadow-sm"
                  aria-hidden="true"
                >
                  {template.emoji}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold leading-tight">
                    {t(`routines.templates.items.${template.key}.title`, {
                      defaultValue: template.title,
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {totalMinutes > 0
                      ? t("routines.templates.metaWithTime", {
                          steps: stepCount,
                          minutes: totalMinutes,
                        })
                      : t("routines.templates.metaSteps", {
                          steps: stepCount,
                        })}
                  </span>
                  {daysLabel && (
                    <span className="mt-1 text-xs text-muted-foreground">
                      {daysLabel}
                    </span>
                  )}
                  {gentle && (
                    <span className="mt-1 text-xs text-primary">
                      {t("routines.templates.gentleHint")}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("routines.templates.seeAll", {
            count: ROUTINE_TEMPLATES.length,
          })}
        </button>
      )}
    </div>
  );
}
