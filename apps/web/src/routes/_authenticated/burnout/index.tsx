import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  HeartPulse,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { ResultSection } from "./result-section";



export const Route = createFileRoute("/_authenticated/burnout/")({
  component: BurnoutChecklistPage,
  staticData: { crumb: "nav.burnout" },
});

// Seven items adapted from the Parental Burnout Assessment (Roskam &
// Mikolajczak), reworded in plain French. The whole point is a mirror
// the parent can hold up to themselves — not a diagnostic instrument.
// `docs/freemium-ethics-policy.md` § 5 forbids the word "diagnostic"
// in user-facing copy and that rule is enforced here.
const QUESTION_KEYS = [
  "burnout.q.morningExhaustion",
  "burnout.q.emotionalDrained",
  "burnout.q.distantFromChild",
  "burnout.q.lostFormerSelf",
  "burnout.q.guiltyParent",
  "burnout.q.noEnergyForSimpleMoments",
  "burnout.q.cantAssumeRole",
] as const;

// 0 = never, 1 = sometimes, 2 = often, 3 = all the time. Linear scoring
// so the parent can intuit how the total relates to the cap (21).
const SCALE_VALUES = [0, 1, 2, 3] as const;
const SCALE_KEYS = [
  "burnout.scale.never",
  "burnout.scale.sometimes",
  "burnout.scale.often",
  "burnout.scale.always",
] as const;


function BurnoutChecklistPage() {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    QUESTION_KEYS.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);

  const total = answers.reduce<number>((sum, v) => sum + (v ?? 0), 0);
  const allAnswered = answers.every((v) => v !== null);

  const reset = () => {
    setAnswers(QUESTION_KEYS.map(() => null));
    setSubmitted(false);
  };

  const setAnswer = (index: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("burnout.title")}
        description={t("burnout.subtitle")}
      />

      <Card className="border-info-border bg-info-surface/40">
        <CardContent className="py-4 text-sm leading-relaxed text-foreground/90">
          {t("burnout.disclaimer")}
        </CardContent>
      </Card>

      {!submitted ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-4" />
              {t("burnout.formTitle")}
            </CardTitle>
            <CardDescription>{t("burnout.formHint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTION_KEYS.map((key, idx) => (
              <fieldset
                key={key}
                className="space-y-2"
                aria-describedby={`q${idx}-help`}
              >
                <legend className="text-sm font-medium">
                  {idx + 1}. {t(key)}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {SCALE_VALUES.map((v, i) => {
                    const active = answers[idx] === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAnswer(idx, v)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/60 bg-background hover:bg-accent"
                        )}
                      >
                        {t(SCALE_KEYS[i]!)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <Button
              size="lg"
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
            >
              {t("burnout.seeResult")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ResultSection score={total} onReset={reset} />
      )}
    </div>
  );
}

