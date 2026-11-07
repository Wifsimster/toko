import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUp, Plus, X } from "lucide-react";
import type { PictoName } from "@focusflow/mo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SignupCtaLink } from "@/components/shared/signup-cta-link";
import { Picto } from "@/components/mo/companion";
import { useSeoHead } from "@/hooks/use-seo-head";
import { cn } from "@/lib/utils";
import { PrintButton, ToolHero, ToolStep } from "@/components/outils/tool-layout";

type Moment = "matin" | "soir";
type Step = { label: string; picto: PictoName };

const STEPS: Record<Moment, readonly Step[]> = {
  matin: [
    { label: "Se lever", picto: "reveil" },
    { label: "Toilette", picto: "lavabo" },
    { label: "S'habiller", picto: "habits" },
    { label: "Petit-déjeuner", picto: "bol" },
    { label: "Médicament", picto: "medicament" },
    { label: "Se brosser les dents", picto: "dents" },
    { label: "Mettre ses chaussures", picto: "chaussures" },
    { label: "Prendre son cartable", picto: "cartable" },
    { label: "Un câlin avant de partir", picto: "calin" },
  ],
  soir: [
    { label: "Fin des écrans", picto: "ecran" },
    { label: "Préparer le cartable", picto: "cartable" },
    { label: "Dîner", picto: "repas" },
    { label: "Douche ou bain", picto: "douche" },
    { label: "Mettre son pyjama", picto: "pyjama" },
    { label: "Se brosser les dents", picto: "dents" },
    { label: "Une histoire", picto: "livre" },
    { label: "Un câlin", picto: "calin" },
    { label: "Lumière douce", picto: "lampe" },
  ],
};

const DEFAULTS: Record<Moment, readonly string[]> = {
  matin: ["Se lever", "Toilette", "S'habiller", "Petit-déjeuner", "Se brosser les dents", "Mettre ses chaussures", "Prendre son cartable"],
  soir: ["Fin des écrans", "Dîner", "Douche ou bain", "Mettre son pyjama", "Se brosser les dents", "Une histoire", "Un câlin"],
};

const pick = (moment: Moment): Step[] => STEPS[moment].filter((s) => DEFAULTS[moment].includes(s.label));

const MAX_STEPS = 8;
const WEEK = ["L", "M", "M", "J", "V", "S", "D"];

export function RoutinePage() {
  useSeoHead({
    title: "Routine visuelle enfant à imprimer (matin et soir) | Tokō",
    description:
      "Créez gratuitement la routine en images de votre enfant : choisissez les étapes du matin ou du soir, mettez-les dans l'ordre, imprimez. Avec des cases à cocher pour la semaine.",
    canonical: "https://toko.battistella.ovh/outils/routine",
  });

  const nameId = useId();
  const [moment, setMoment] = useState<Moment>("matin");
  const [chosen, setChosen] = useState<Record<Moment, Step[]>>(() => ({
    matin: pick("matin"),
    soir: pick("soir"),
  }));
  const [name, setName] = useState("");
  const [week, setWeek] = useState(true);

  const steps = chosen[moment];
  const available = STEPS[moment].filter((s) => !steps.some((c) => c.label === s.label));
  const update = (next: Step[]) => setChosen((c) => ({ ...c, [moment]: next }));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const next = [...steps];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    update(next);
  };
  const trimmed = name.trim();
  const title = `La routine du ${moment}${trimmed ? ` de ${trimmed}` : ""}`;

  return (
    <div className="outil-print min-h-dvh bg-background">
      <div className="outil-print-controls mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <ToolHero
          tile="bg-surface-honey"
          mo="theme-cadre"
          eyebrow="Gratuit · à imprimer"
          title="Routine en images"
          intro="Les étapes du matin ou du soir, dans l'ordre, en grandes images. Votre enfant voit où il en est sans qu'on ait à répéter."
        />

        <div className="mt-8 grid gap-5">
          <ToolStep index={1} title="Quel moment ?">
            <div role="radiogroup" aria-label="Moment de la routine" className="grid max-w-sm grid-cols-2 gap-2">
              {(["matin", "soir"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={moment === m}
                  onClick={() => setMoment(m)}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm font-semibold transition-colors",
                    moment === m ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent",
                  )}
                >
                  {m === "matin" ? "Le matin" : "Le soir"}
                </button>
              ))}
            </div>
            <div className="grid max-w-sm gap-1.5">
              <Label htmlFor={nameId}>Prénom de l'enfant (facultatif)</Label>
              <Input id={nameId} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="off" />
            </div>
          </ToolStep>

          <ToolStep index={2} title="Les étapes, dans l'ordre" hint={`${MAX_STEPS} étapes au plus : moins, c'est plus facile à suivre.`}>
            <ol className="grid gap-2">
              {steps.map((step, i) => (
                <li key={step.label} className="flex items-center gap-3 rounded-2xl bg-muted/60 py-1.5 pl-2 pr-1.5">
                  <span className="w-6 text-center font-heading text-sm font-extrabold text-brand-strong">{i + 1}</span>
                  <Picto name={step.picto} size={36} />
                  <span className="min-w-0 flex-1 text-sm font-semibold">{step.label}</span>
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label={`Monter « ${step.label} »`}
                    className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-card disabled:opacity-30 md:size-9"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === steps.length - 1}
                    aria-label={`Descendre « ${step.label} »`}
                    className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-card disabled:opacity-30 md:size-9"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => update(steps.filter((_, j) => j !== i))}
                    aria-label={`Retirer « ${step.label} »`}
                    className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-card md:size-9"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ol>
            {available.length > 0 && steps.length < MAX_STEPS && (
              <div>
                <p className="text-sm font-semibold">Ajouter une étape</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {available.map((step) => (
                    <button
                      key={step.label}
                      type="button"
                      onClick={() => update([...steps, step])}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-muted px-4 text-sm font-semibold hover:bg-accent md:min-h-9"
                    >
                      <Plus className="size-3.5" aria-hidden />
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ToolStep>

          <ToolStep index={3} title="Cases à cocher">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={week}
                onChange={(e) => setWeek(e.target.checked)}
                className="size-5 accent-[var(--brand)]"
              />
              Ajouter une case par jour de la semaine sous chaque étape
            </label>
          </ToolStep>
        </div>

        <div className="mt-8 flex flex-col items-start gap-3">
          <PrintButton outil="routine" />
          <p className="text-sm text-muted-foreground">Rien n'est envoyé : la routine est préparée sur votre appareil.</p>
        </div>

        <h2 className="mt-12 font-heading text-lg font-extrabold tracking-tight">Aperçu</h2>
      </div>

      <div className="fiche-doc mx-auto mt-4 max-w-3xl px-4 pb-10 sm:px-6">
        <div className="rounded-[1.75rem] bg-card p-6 ring-1 ring-foreground/10 sm:p-8 print:rounded-none print:bg-white print:p-0 print:ring-0">
          <div className="flex items-start justify-between gap-4">
            <p className="font-heading text-3xl font-extrabold tracking-tight">{title}</p>
            <BrandLogo className="size-8 shrink-0 rounded-lg" />
          </div>
          <ol className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            {steps.map((step, i) => (
              <li
                key={step.label}
                className="fiche-block routine-card flex min-w-0 flex-col items-center rounded-3xl border-2 border-border p-3 text-center sm:p-4"
              >
                <span className="self-start font-heading text-lg font-extrabold text-brand-strong">{i + 1}</span>
                <Picto name={step.picto} size={steps.length > 6 ? 72 : 96} />
                <span className="mt-2 font-heading text-base font-extrabold leading-tight sm:text-lg">{step.label}</span>
                {week && (
                  <span className="mt-3 flex flex-wrap justify-center gap-1 sm:gap-1.5" aria-hidden>
                    {WEEK.map((d, j) => (
                      <span key={j} className="flex flex-col items-center gap-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                        {d}
                        <span className="size-4 rounded-md border-2 border-foreground/30 sm:size-5" />
                      </span>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-6 text-xs text-muted-foreground">Routine préparée avec Tokō · toko.battistella.ovh/outils</p>
        </div>
      </div>

      <div className="outil-print-controls mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] bg-card p-6 ring-1 ring-foreground/10">
            <p className="font-heading text-lg font-extrabold tracking-tight">Pourquoi des images ?</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ce que les fonctions exécutives changent au quotidien, et pourquoi un repère visible aide plus qu'un rappel.
            </p>
            <Link
              to="/ressources/$slug"
              params={{ slug: "fonctions-executives-tdah-enfant" }}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-strong hover:underline"
            >
              Lire l'article
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="rounded-[1.75rem] bg-surface-mint p-6">
            <p className="font-heading text-lg font-extrabold tracking-tight">La routine sur la tablette</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              Dans Tokō, la routine se suit étape par étape, avec un minuteur et des récompenses.
            </p>
            <SignupCtaLink location="outil_routine" className={cn(buttonVariants(), "mt-4 gap-2")}>
              Essayer Tokō gratuitement
              <ArrowRight className="size-3.5" aria-hidden />
            </SignupCtaLink>
          </div>
        </div>
      </div>
    </div>
  );
}
