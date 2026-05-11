import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  HeartPulse,
  RotateCcw,
  Phone,
  ExternalLink,
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

type Zone = "green" | "orange" | "red";

// Thresholds picked so the three zones map to roughly equal slices of
// the 0–21 range, slightly shifted to make orange easier to hit than
// green — the goal is to spot fatigue early, not to reassure the
// borderline cases.
function zoneFromScore(score: number): Zone {
  if (score <= 6) return "green";
  if (score <= 13) return "orange";
  return "red";
}

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
              <HeartPulse className="h-4 w-4" />
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

function ResultSection({
  score,
  onReset,
}: {
  score: number;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const zone = zoneFromScore(score);

  const zoneClasses: Record<Zone, string> = {
    green:
      "border-success-border bg-success-surface text-success-foreground",
    orange:
      "border-warning-border bg-warning-surface text-warning-foreground",
    red:
      "border-destructive/40 bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-4">
      <Card className={cn("border-2", zoneClasses[zone])}>
        <CardContent className="py-5 space-y-2">
          <p className="text-xs uppercase tracking-wide opacity-80">
            {t(`burnout.zone.${zone}.label`)}
          </p>
          <p className="text-base font-semibold leading-relaxed">
            {t(`burnout.zone.${zone}.title`)}
          </p>
          <p className="text-sm leading-relaxed">
            {t(`burnout.zone.${zone}.body`)}
          </p>
          <p className="text-xs opacity-80">
            {t("burnout.scoreOutOf", { score, total: 21 })}
          </p>
        </CardContent>
      </Card>

      {zone === "red" && <SupportResources />}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {t("burnout.retake")}
        </Button>
      </div>
    </div>
  );
}

// Mirrors the support resources shown on the crisis-list page so the
// numbers stay consistent across the app. Always free, no upsell.
function SupportResources() {
  const { t } = useTranslation();
  return (
    <Card className="border-info-border bg-info-surface/40">
      <CardContent className="space-y-3 py-4">
        <div className="space-y-1">
          <p className="font-medium text-sm">{t("burnout.support.title")}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("burnout.support.body")}
          </p>
        </div>
        <ul className="space-y-2">
          <li>
            <a
              href="tel:3114"
              className="flex items-start gap-2 rounded-md p-2 -mx-2 hover:bg-accent/50 transition-colors"
            >
              <Phone className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">
                  {t("burnout.support.tel3114Label")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("burnout.support.tel3114Hint")}
                </span>
              </span>
            </a>
          </li>
          <li>
            <a
              href="tel:0800235236"
              className="flex items-start gap-2 rounded-md p-2 -mx-2 hover:bg-accent/50 transition-colors"
            >
              <Phone className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">
                  {t("burnout.support.alloParentsLabel")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("burnout.support.alloParentsHint")}
                </span>
              </span>
            </a>
          </li>
          <li>
            <a
              href="https://www.tdah-france.fr/"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-start gap-2 rounded-md p-2 -mx-2 hover:bg-accent/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">
                  {t("burnout.support.hyperSupersLabel")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("burnout.support.hyperSupersHint")}
                </span>
              </span>
            </a>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
