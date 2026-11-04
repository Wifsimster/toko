import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { Mo } from "@/components/mo/mo";
import { buttonVariants } from "@/components/ui/button-variants";
import { useGarden } from "@/hooks/use-pauses";
import { cn } from "@/lib/utils";
import { GardenWeek } from "./garden-week";

export function PauseCard({ primary = false }: { primary?: boolean }) {
  const { t } = useTranslation();
  const { data: garden } = useGarden();

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section
        aria-labelledby="pause-card-title"
        className="relative overflow-hidden rounded-[28px] bg-surface-mint p-5"
      >
        <Mo state="calme" size={104} className="absolute top-2 right-2 sm:top-3 sm:right-4" />
        <p aria-hidden="true" className="font-hand pr-28 text-[21px] leading-none font-semibold">
          {t("pause.card.kicker")}
        </p>
        <h2
          id="pause-card-title"
          className="mt-1 max-w-[calc(100%-7.5rem)] text-[23px] leading-[1.15] font-extrabold tracking-[-0.02em] [overflow-wrap:anywhere]"
        >
          {t("pause.card.title")}
        </h2>
        <p className="mt-2 max-w-[calc(100%-7.5rem)] text-[0.9375rem] leading-snug text-muted-foreground">
          {t("pause.card.body")}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            to="/pause"
            className={cn(
              buttonVariants({ variant: primary ? "default" : "outline", size: "lg" }),
              "min-h-11 rounded-full px-5 md:h-11",
              !primary && "bg-card",
            )}
          >
            <Play className="size-4" aria-hidden="true" />
            {t("pause.card.cta")}
          </Link>
          <span className="rounded-full bg-card px-3 py-1.5 text-sm font-semibold">
            {t("pause.card.duration")}
          </span>
        </div>
      </section>

      <section aria-labelledby="garden-card-title" className="rounded-[28px] border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="garden-card-title" className="text-[0.9375rem] font-semibold">
              {t("pause.garden.title")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("pause.garden.cardBody")}</p>
          </div>
          <Link to="/jardin" className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-brand-strong underline-offset-4 hover:underline">
            {t("pause.garden.see")}
          </Link>
        </div>
        {garden && <GardenWeek week={garden.week} today={garden.today} className="mt-3" />}
      </section>
    </div>
  );
}
