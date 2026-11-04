import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Mo } from "@/components/mo/mo";
import { Button } from "@/components/ui/button";
import { useLogMedication, useMedicationAdherence, type MedicationAdherence } from "@/hooks/use-medications";
import { todayISO } from "@/lib/date";

export function MedicationTodayCard({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const { data } = useMedicationAdherence(childId);
  const logMedication = useLogMedication();
  const meds = data?.medications ?? [];
  if (meds.length === 0) return null;

  const next = meds.find((m) => m.todayTaken === null) ?? null;
  const log = (med: MedicationAdherence, taken: boolean) =>
    logMedication.mutate({ medicationId: med.id, childId, date: todayISO(), taken });

  return (
    <section aria-labelledby="medication-today-title" className="relative overflow-hidden rounded-[28px] bg-surface-sky p-5">
      <Mo state="theme-soins" size={112} className="absolute top-2 right-2 sm:right-4" />
      <p aria-hidden="true" className="font-hand pr-28 text-[21px] leading-none font-semibold">
        {t("medications.today.kicker")}
      </p>
      {next ? (
        <>
          <h2
            id="medication-today-title"
            className="mt-1 max-w-[calc(100%-7.5rem)] text-[23px] leading-[1.15] font-extrabold tracking-[-0.02em] [overflow-wrap:anywhere]"
          >
            {next.name}
          </h2>
          <p className="mt-1 max-w-[calc(100%-7.5rem)] text-sm text-muted-foreground">
            {[next.dose, t(`medications.today.schedule.${next.schedule}`, { defaultValue: "" })].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              className="min-h-11 rounded-full px-5 md:h-11"
              disabled={logMedication.isPending}
              onClick={() => log(next, true)}
            >
              <Check className="size-4" aria-hidden="true" />
              {t("medications.today.taken")}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="min-h-11 rounded-full px-4 md:h-11"
              disabled={logMedication.isPending}
              onClick={() => log(next, false)}
            >
              {t("medications.today.notToday")}
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 id="medication-today-title" className="mt-1 max-w-[calc(100%-7.5rem)] text-[23px] leading-[1.15] font-extrabold">
            {t("medications.today.allDone")}
          </h2>
          <p className="mt-1 max-w-[calc(100%-7.5rem)] text-sm text-muted-foreground">{t("medications.today.allDoneHint")}</p>
        </>
      )}
    </section>
  );
}
