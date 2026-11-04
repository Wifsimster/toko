import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Mo } from "@/components/mo/mo";
import { MoodBadge } from "@/components/mo/mood-badge";
import type { MoodScore } from "@/components/mo/parent-mood-faces";
import { GardenArt } from "@/components/pause/garden-art";
import { buttonVariants } from "@/components/ui/button-variants";
import { useGarden } from "@/hooks/use-pauses";
import { useUpsertParentMood } from "@/hooks/use-parent-mood";
import { todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";

const AFTER_MOODS: ReadonlyArray<{ score: MoodScore; key: string }> = [
  { score: 4, key: "calme" },
  { score: 1, key: "fatigue" },
  { score: 2, key: "tropPlein" },
];

export function PauseEnd({
  minutes,
  onAgain,
  recording,
}: {
  minutes: number;
  onAgain: () => void;
  recording: boolean;
}) {
  const { t } = useTranslation();
  const { data: garden } = useGarden();
  const upsertMood = useUpsertParentMood();
  const [picked, setPicked] = useState<MoodScore | null>(null);
  const leaves = garden?.leaves ?? 0;

  const pick = (score: MoodScore) => {
    setPicked(score);
    upsertMood.mutate({ date: todayISO(), score });
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center pb-6 text-center">
      <div className="relative mt-2 h-56 w-full max-w-[20rem]">
        <div className="absolute bottom-0 left-0 w-36">
          <GardenArt leaves={leaves} freshLast={!recording} />
        </div>
        <Mo state="fierte" size={150} className="absolute right-0 bottom-0" />
        <p
          aria-hidden="true"
          className="font-hand absolute top-6 left-24 -rotate-3 text-[21px] leading-none font-semibold whitespace-pre text-brand-strong"
        >
          {t("pause.end.note")}
        </p>
      </div>

      <h1 className="mt-4 text-[30px] leading-tight font-extrabold tracking-[-0.02em]">{t("pause.end.title")}</h1>
      <p className="mt-2 max-w-xs text-[0.9375rem] leading-snug text-muted-foreground">
        {t("pause.end.body", { count: minutes })}
      </p>

      <section aria-labelledby="pause-after-mood" className="mt-6 w-full rounded-[24px] bg-surface-mint p-4">
        <h2 id="pause-after-mood" className="text-[0.9375rem] font-semibold">
          {t("pause.end.moodTitle")}
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {AFTER_MOODS.map(({ score, key }) => (
            <button
              key={score}
              type="button"
              aria-pressed={picked === score}
              onClick={() => pick(score)}
              className={cn(
                "rounded-2xl border-2 border-transparent bg-card p-1 transition-colors",
                picked === score && "border-foreground",
              )}
            >
              <MoodBadge
                score={score}
                size="md"
                label={t(`pause.end.moods.${key}`)}
                className="flex-col gap-1 bg-transparent px-0 py-1 text-center"
                trailing={picked === score ? <Check className="size-4" aria-hidden="true" /> : undefined}
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("pause.end.moodHint")}</p>
      </section>

      <Link
        to="/dashboard"
        className={cn(buttonVariants({ size: "lg" }), "mt-8 min-h-12 w-full rounded-full md:h-12")}
      >
        {t("pause.end.home")}
      </Link>
      <button
        type="button"
        onClick={onAgain}
        className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "mt-2 min-h-12 w-full rounded-full md:h-12")}
      >
        {t("pause.end.again")}
      </button>
      <Link to="/jardin" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand-strong underline-offset-4 hover:underline">
        {t("pause.end.seeGarden")}
      </Link>
    </div>
  );
}
