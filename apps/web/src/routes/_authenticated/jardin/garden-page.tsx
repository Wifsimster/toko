import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { Mo } from "@/components/mo/mo";
import { PageHeader } from "@/components/layout/page-header";
import { GardenArt } from "@/components/pause/garden-art";
import { GardenWeek } from "@/components/pause/garden-week";
import { buttonVariants } from "@/components/ui/button-variants";
import { PageLoader } from "@/components/ui/page-loader";
import { useGarden } from "@/hooks/use-pauses";
import { cn } from "@/lib/utils";

export default function GardenPage() {
  const { t } = useTranslation();
  const { data: garden, isLoading } = useGarden();

  if (isLoading || !garden) return <PageLoader />;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <PageHeader title={t("pause.garden.title")} description={t("pause.garden.pageBody")} />

      <section className="overflow-hidden rounded-[28px] border border-sage-200 bg-sage-100 p-5">
        <p aria-hidden="true" className="font-hand text-[21px] leading-none font-semibold whitespace-pre text-brand-strong">
          {t("pause.garden.note")}
        </p>
        <div className="mx-auto mt-2 w-full max-w-[13rem]">
          <GardenArt leaves={garden.leaves} />
        </div>
        <div className="mt-3 flex items-end justify-end gap-3">
          {garden.leaves === 0 && (
            <p className="flex-1 self-center text-sm text-muted-foreground">{t("pause.garden.empty")}</p>
          )}
          <Mo state="calme" size={80} className="shrink-0" />
        </div>
      </section>

      <section aria-labelledby="garden-week-title" className="rounded-[28px] border border-border bg-card p-5">
        <h2 id="garden-week-title" className="text-[0.9375rem] font-semibold">
          {t("pause.garden.thisWeek")}
        </h2>
        <GardenWeek week={garden.week} today={garden.today} className="mt-3" />
        <p className="mt-3 text-xs text-muted-foreground">{t("pause.garden.noFailure")}</p>
      </section>

      <Link to="/pause" className={cn(buttonVariants({ size: "lg" }), "min-h-12 w-full rounded-full md:h-12")}>
        <Play className="size-4" aria-hidden="true" />
        {t("pause.garden.cta")}
      </Link>
    </div>
  );
}
