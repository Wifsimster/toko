import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { letsGoScene, meetMoScene, promiseScene, splashArrowScene, splashScene } from "@focusflow/mo/scenes";
import { moIcons } from "@focusflow/mo/icons";
import { Mo } from "@/components/mo/mo";
import { MO_DARK_PLATE, MoIconArt, MoScene } from "@/components/mo/mo-scene";
import { preloadMoArt } from "@/components/mo/use-mo-art";
import { useChildren } from "@/hooks/use-children";
import { useUpsertParentMood } from "@/hooks/use-parent-mood";
import { todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { GOALS, MOODS, ONBOARDING_ART, type MoodId } from "./onboarding-data";

/** Charge les dessins de Mō avant le premier écran. */
export function preloadOnboarding(): Promise<void> {
  return preloadMoArt(ONBOARDING_ART);
}

// 0 splash, 1 promesse, 2 humeur, 3 objectif, 4 « Voici Mō », 5 « C'est parti ».
const LAST_STEP = 5;
// La pagination compte les écrans 1 à 5 (le splash n'en fait pas partie).
const PAGED_STEPS = 5;

const focusRing =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Premier lancement : six écrans courts (direction « Mō », écrans 01 à 06).
 * Aucun prix ni paywall ici (docs/freemium-ethics-policy.md). « Passer », la
 * touche Échap et « Plus tard » ferment le parcours sans rien perdre de ce
 * qui a déjà été répondu.
 */
export function OnboardingFlow() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const completeOnboarding = useUiStore((s) => s.completeOnboarding);
  const goal = useUiStore((s) => s.onboardingGoal);
  const setGoal = useUiStore((s) => s.setOnboardingGoal);
  const setAddChildRequested = useUiStore((s) => s.setAddChildRequested);
  const { data: children } = useChildren();
  const upsertMood = useUpsertParentMood();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MoodId | null>(null);
  const savedScore = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasChildren = (children?.length ?? 0) > 0;

  // À chaque écran, le focus va au titre : un lecteur d'écran annonce le
  // nouvel écran, et Tab repart du haut.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const saveMood = () => {
    const score = MOODS.find((m) => m.id === mood)?.score ?? null;
    if (score === null || savedScore.current === score) return;
    savedScore.current = score;
    upsertMood.mutate({ date: todayISO(), score });
  };

  const close = (then?: "add-child") => {
    completeOnboarding();
    if (then === "add-child") setAddChildRequested(true);
    void navigate({ to: "/dashboard" });
  };

  const next = () => {
    if (step === 2) saveMood();
    setStep((s) => Math.min(LAST_STEP, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const title = (text: ReactNode, className?: string) => (
    <DialogPrimitive.Title
      ref={headingRef}
      render={<h1 />}
      tabIndex={-1}
      className={cn(
        // 33 px comme la maquette ; au zoom 200 % (≈ 195 px de large), le titre
        // descend jusqu'à 26 px pour ne pas créer de défilement horizontal.
        "whitespace-pre-line text-[clamp(1.625rem,8.5vw,33px)] leading-[1.1] font-extrabold tracking-[-0.025em] outline-none [overflow-wrap:anywhere]",
        className
      )}
    >
      {text}
    </DialogPrimitive.Title>
  );

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup
          initialFocus={headingRef}
          data-testid="onboarding"
          className="fixed inset-0 z-[60] overflow-y-auto bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-foreground outline-none"
        >
          <div className="mx-auto flex min-h-full w-full max-w-[440px] flex-col px-4 sm:px-6 sm:py-6">
            {step > 0 && (
              <div className="flex h-12 items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={back}
                    aria-label={t("onboarding.back")}
                    className={cn("-ml-2 flex size-11 items-center justify-center rounded-full", focusRing)}
                  >
                    <ArrowLeft className="size-[22px]" aria-hidden="true" />
                  </button>
                ) : (
                  <span />
                )}
                {step < LAST_STEP && (
                  <button
                    type="button"
                    onClick={() => close()}
                    className={cn("-mr-1 h-11 min-w-11 rounded-full px-2.5 text-[15px] font-semibold", focusRing)}
                  >
                    {t("onboarding.skip")}
                  </button>
                )}
              </div>
            )}

            {step === 0 && (
              <div className="flex flex-1 flex-col pt-16 sm:pt-10">
                <div className={cn("mt-6 dark:pt-8", MO_DARK_PLATE)}>
                  <div className="relative">
                    <MoScene
                      plate={false}
                      scene={splashScene}
                      notes={[{ text: t("onboarding.splash.note"), x: 284, y: -22, rotate: -6 }]}
                    />
                    <div className="absolute inset-x-0" style={{ top: `${(-10 / 300) * 100}%` }}>
                      <MoScene plate={false} scene={splashArrowScene} />
                    </div>
                  </div>
                </div>
                <DialogPrimitive.Title
                  ref={headingRef}
                  render={<h1 />}
                  tabIndex={-1}
                  className="mt-4 text-center font-wordmark text-6xl font-semibold tracking-normal outline-none"
                >
                  Tokō
                </DialogPrimitive.Title>
                <p className="mt-3 text-center text-base text-muted-foreground">{t("onboarding.splash.tagline")}</p>
                <div className="mt-auto pt-10 pb-8">
                  <PrimaryButton onClick={next}>{t("onboarding.splash.start")}</PrimaryButton>
                </div>
              </div>
            )}

            {step === 1 && (
              <StepBody footer={<Footer current={0} onNext={next} />}>
                {title(t("onboarding.promise.title"))}
                <p className="mt-3 max-w-[320px] text-base leading-normal text-muted-foreground">
                  {t("onboarding.promise.body")}
                </p>
                <MoScene
                  className="mt-4 -mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)]"
                  scene={promiseScene}
                  breathe
                  notes={[
                    { text: t("onboarding.promise.noteBreathe"), x: 26, y: 104, rotate: -5 },
                    { text: t("onboarding.promise.noteOneThing"), x: 282, y: 160, rotate: 4, align: "center" },
                    { text: t("onboarding.promise.noteRest"), x: 40, y: 380, rotate: -3 },
                  ]}
                />
              </StepBody>
            )}

            {step === 2 && (
              <StepBody footer={<Footer current={1} onNext={next} />}>
                {title(t("onboarding.mood.title"))}
                <p className="mt-3 max-w-[320px] text-base leading-normal text-muted-foreground">
                  {t("onboarding.mood.body")}
                </p>
                <fieldset className="mt-6">
                  <legend className="sr-only">{t("onboarding.mood.legend")}</legend>
                  <div className="grid grid-cols-1 gap-3 min-[300px]:grid-cols-2">
                    {MOODS.map((m) => {
                      const checked = mood === m.id;
                      return (
                        <label
                          key={m.id}
                          className={cn(
                            "relative flex min-h-[146px] cursor-pointer flex-col items-center justify-end gap-1 rounded-[26px] px-2.5 pt-2 pb-3.5 text-center",
                            m.surface,
                            checked && "ring-[2.5px] ring-foreground",
                            "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                          )}
                        >
                          <input
                            type="radio"
                            name="onboarding-mood"
                            value={m.id}
                            checked={checked}
                            onChange={() => setMood(m.id)}
                            className="sr-only"
                          />
                          {checked && <CheckBadge />}
                          <Mo state={m.state} size={112} className="-mt-1 -mb-2" />
                          <span className="text-[15px] leading-tight font-semibold [overflow-wrap:anywhere]">
                            {t(`onboarding.mood.options.${m.id}`)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </StepBody>
            )}

            {step === 3 && (
              <StepBody footer={<Footer current={2} onNext={next} />}>
                <div className="relative min-[300px]:pr-12">
                  {title(t("onboarding.goal.title"))}
                  <MoIconArt icon={moIcons.traits} inkFollowsText className="absolute right-1 bottom-0 size-10 max-[299px]:hidden" />
                </div>
                <p className="mt-3 max-w-[320px] text-base leading-normal text-muted-foreground">
                  {t("onboarding.goal.body")}
                </p>
                <fieldset className="mt-6">
                  <legend className="sr-only">{t("onboarding.goal.legend")}</legend>
                  <div className="flex flex-col gap-2.5">
                    {GOALS.map((g) => {
                      const checked = goal === g.id;
                      return (
                        <label
                          key={g.id}
                          className={cn(
                            "flex min-h-[76px] cursor-pointer items-center gap-3 rounded-3xl py-2.5 pr-[18px] pl-3",
                            g.surface,
                            checked && "ring-[2.5px] ring-foreground",
                            "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                          )}
                        >
                          <input
                            type="radio"
                            name="onboarding-goal"
                            value={g.id}
                            checked={checked}
                            onChange={() => setGoal(g.id)}
                            className="sr-only"
                          />
                          {/* Décoratif : masqué quand la place manque (zoom 200 %), le texte passe avant. */}
                          <MoIconArt
                            icon={moIcons[g.icon]}
                            className="size-[54px] shrink-0 max-[299px]:hidden dark:rounded-full dark:bg-[#FBF6EE]"
                          />
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="text-base font-bold [overflow-wrap:anywhere]">
                              {t(`onboarding.goal.options.${g.id}.title`)}
                            </span>
                            <span className="text-[13.5px] leading-snug text-muted-foreground [overflow-wrap:anywhere]">
                              {t(`onboarding.goal.options.${g.id}.body`)}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                              checked ? "border-primary bg-primary" : "border-muted-foreground"
                            )}
                          >
                            {checked && <span className="size-2 rounded-full bg-primary-foreground" />}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </StepBody>
            )}

            {step === 4 && (
              <StepBody footer={<Footer current={3} onNext={next} />}>
                {title(t("onboarding.meet.title"))}
                <p className="mt-3 max-w-[320px] text-base leading-normal text-muted-foreground">
                  {t("onboarding.meet.body")}
                </p>
                <MoScene
                  className="mt-10 -mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)]"
                  scene={meetMoScene}
                  notes={[
                    { text: t("onboarding.meet.noteTrait"), x: 176, y: -20, rotate: 3 },
                    { text: t("onboarding.meet.noteTime"), x: 24, y: 114, rotate: -6 },
                  ]}
                />
                <ul
                  aria-label={t("onboarding.meet.legendLabel")}
                  className="mt-4 flex flex-wrap justify-around gap-y-2 rounded-[22px] bg-card px-2 py-3 ring-1 ring-foreground/10"
                >
                  {(["calme", "trop-plein", "fatigue", "fierte"] as const).map((s) => (
                    <li key={s} className="flex min-w-16 flex-col items-center">
                      <Mo state={s} size={52} />
                      <span className="text-[13px] font-semibold text-muted-foreground">
                        {t(`onboarding.meet.legend.${s}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </StepBody>
            )}

            {step === 5 && (
              <div className="flex flex-1 flex-col text-center">
                {title(t("onboarding.go.title"), "mt-2")}
                <p className="mx-auto mt-3 max-w-[320px] text-base leading-normal text-muted-foreground">
                  {hasChildren ? t("onboarding.go.bodyHasChildren") : t("onboarding.go.body")}
                </p>
                <MoScene
                  className="mt-2 -mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)]"
                  scene={letsGoScene}
                  notes={[{ text: t("onboarding.go.note"), x: 280, y: 160, rotate: -6, align: "center" }]}
                />
                <div className="mt-auto flex flex-col items-center gap-4 pt-4 pb-6">
                  <Pagination current={4} />
                  <div className="flex w-full flex-col gap-1.5">
                    {hasChildren ? (
                      <PrimaryButton onClick={() => close()}>{t("onboarding.go.ctaHasChildren")}</PrimaryButton>
                    ) : (
                      <>
                        <PrimaryButton onClick={() => close("add-child")}>{t("onboarding.go.cta")}</PrimaryButton>
                        <button
                          type="button"
                          onClick={() => close()}
                          className={cn(
                            "mx-auto h-11 rounded-full px-4 text-[15px] font-semibold text-muted-foreground",
                            focusRing
                          )}
                        >
                          {t("onboarding.go.later")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function StepBody({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="pt-2.5">{children}</div>
      {footer}
    </div>
  );
}

function Pagination({ current }: { current: number }) {
  const { t } = useTranslation();
  return (
    <ol aria-label={t("onboarding.progressLabel")} className="flex items-center gap-[7px]">
      {Array.from({ length: PAGED_STEPS }, (_, i) => (
        <li
          key={i}
          aria-current={i === current ? "step" : undefined}
          className={cn(
            "h-[7px] rounded-full",
            i === current ? "w-[22px] bg-brand" : "w-[7px] bg-muted-foreground/70"
          )}
        >
          <span className="sr-only">{t("onboarding.stepAria", { index: i + 1, total: PAGED_STEPS })}</span>
        </li>
      ))}
    </ol>
  );
}

function Footer({ current, onNext }: { current: number; onNext: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="mt-auto flex items-center justify-between gap-3 pt-6 pb-8">
      <span className="size-16 shrink-0 max-[299px]:hidden" aria-hidden="true" />
      <Pagination current={current} />
      <button
        type="button"
        onClick={onNext}
        aria-label={t("onboarding.next")}
        className={cn(
          "flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95",
          focusRing
        )}
      >
        <ArrowRight className="size-6" aria-hidden="true" />
      </button>
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3 text-[17px] font-semibold text-primary-foreground transition-transform active:scale-[0.99]",
        focusRing
      )}
    >
      {children}
      <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
    </button>
  );
}

function CheckBadge() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-3 right-3 flex size-[26px] items-center justify-center rounded-full bg-primary text-primary-foreground"
    >
      <Check className="size-4" strokeWidth={3} />
    </span>
  );
}
