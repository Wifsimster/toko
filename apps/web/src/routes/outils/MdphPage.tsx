import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { useSeoHead } from "@/hooks/use-seo-head";
import { cn } from "@/lib/utils";
import { PrintButton, ToolHero, ToolStep } from "@/components/outils/tool-layout";

type Ecole = "simple" | "humain" | "non";
type Besoin = "ecole" | "argent" | "soins";

const BESOINS: { id: Besoin; label: string }[] = [
  { id: "ecole", label: "De l'aide à l'école" },
  { id: "argent", label: "Une aide pour les frais" },
  { id: "soins", label: "Un suivi ou des rééducations" },
];

const ECOLE: { id: Ecole; label: string }[] = [
  { id: "simple", label: "Des aménagements simples suffiraient (place, temps, consignes)" },
  { id: "humain", label: "Il faudrait un adulte à côté (AESH) ou du matériel" },
  { id: "non", label: "Je ne sais pas encore" },
];

const SOURCE = "service-public.gouv.fr, page AEEH vérifiée le 1er juin 2026";

function Choice({
  on,
  onClick,
  children,
  role = "checkbox",
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  role?: "checkbox" | "radio";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-colors",
        on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent",
      )}
    >
      <Check className={cn("size-4 shrink-0", on ? "opacity-100" : "opacity-0")} aria-hidden />
      {children}
    </button>
  );
}

function Card({ title, tag, children }: { title: string; tag: string; children: ReactNode }) {
  return (
    <section className="fiche-block rounded-[1.5rem] border-2 border-border p-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-strong">{tag}</p>
      <h3 className="mt-1 font-heading text-xl font-extrabold tracking-tight">{title}</h3>
      <div className="mt-3 grid gap-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Todo({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden className="mt-1 size-4 shrink-0 rounded border-2 border-foreground/40" />
      <span>{children}</span>
    </li>
  );
}

export function MdphPage() {
  useSeoHead({
    title: "MDPH, PAP, AEEH : par où commencer pour votre enfant TDAH ? | Tokō",
    description:
      "Trois questions pour savoir quoi demander (PAP à l'école, dossier MDPH, AEEH) et une liste des documents à réunir, à imprimer. Gratuit, sans compte.",
    canonical: "https://toko.battistella.ovh/outils/mdph",
  });

  const [besoins, setBesoins] = useState<Besoin[]>(["ecole"]);
  const [ecole, setEcole] = useState<Ecole>("non");
  const [moins20, setMoins20] = useState(true);

  const wants = (b: Besoin) => besoins.includes(b);
  const toggle = (b: Besoin) => setBesoins((l) => (l.includes(b) ? l.filter((x) => x !== b) : [...l, b]));
  const showPap = wants("ecole") && ecole !== "humain";
  const needsMdph = (wants("ecole") && ecole !== "simple") || (wants("argent") && moins20) || wants("soins");
  const showAeeh = wants("argent") && moins20;

  return (
    <div className="outil-print min-h-dvh bg-background">
      <div className="outil-print-controls mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <ToolHero
          tile="bg-surface-rose"
          mo="guide"
          eyebrow="Gratuit · 2 min"
          title="Par où commencer avec la MDPH ?"
          intro="PAP, PPS, AESH, AEEH… Trois questions pour savoir quoi demander, à qui, et quels papiers réunir."
        />

        <div className="mt-8 grid gap-5">
          <ToolStep index={1} title="Ce que vous cherchez" hint="Plusieurs choix possibles.">
            <div className="grid gap-2 sm:grid-cols-3">
              {BESOINS.map((b) => (
                <Choice key={b.id} on={wants(b.id)} onClick={() => toggle(b.id)}>
                  {b.label}
                </Choice>
              ))}
            </div>
          </ToolStep>

          {wants("ecole") && (
            <ToolStep index={2} title="À l'école, de quoi aurait-il besoin ?">
              <div role="radiogroup" aria-label="Besoin à l'école" className="grid gap-2">
                {ECOLE.map((e) => (
                  <Choice key={e.id} role="radio" on={ecole === e.id} onClick={() => setEcole(e.id)}>
                    {e.label}
                  </Choice>
                ))}
              </div>
            </ToolStep>
          )}

          <ToolStep index={wants("ecole") ? 3 : 2} title="Votre enfant a-t-il moins de 20 ans ?">
            <div role="radiogroup" aria-label="Âge" className="grid max-w-sm grid-cols-2 gap-2">
              <Choice role="radio" on={moins20} onClick={() => setMoins20(true)}>Oui</Choice>
              <Choice role="radio" on={!moins20} onClick={() => setMoins20(false)}>Non</Choice>
            </div>
          </ToolStep>
        </div>

        <h2 className="mt-12 font-heading text-2xl font-extrabold tracking-tight">Ce que vous pouvez demander</h2>
      </div>

      <div className="fiche-doc mx-auto mt-4 max-w-3xl px-4 pb-8 sm:px-6">
        <div className="hidden items-start justify-between gap-4 print:flex">
          <p className="font-heading text-2xl font-extrabold tracking-tight">Mes démarches</p>
          <BrandLogo className="size-8 shrink-0 rounded-lg" />
        </div>
        <div className="mt-4 grid gap-4 print:mt-6">
          {besoins.length === 0 && (
            <p className="text-sm text-muted-foreground">Choisissez au moins une réponse à la première question.</p>
          )}

          {showPap && (
            <Card tag="À l'école, sans la MDPH" title="Le PAP (plan d'accompagnement personnalisé)">
              <p>
                Pour des aménagements simples : place dans la classe, temps en plus, consignes reformulées. Il se
                demande directement à l'école.
              </p>
              <ul className="grid gap-1.5">
                <Todo>Demander un rendez-vous au directeur ou au chef d'établissement</Todo>
                <Todo>Demander l'avis du médecin scolaire (apporter les comptes rendus)</Todo>
                <Todo>Relire le PAP proposé, il se met à jour chaque année</Todo>
              </ul>
            </Card>
          )}

          {needsMdph && (
            <Card tag="Un seul dossier pour tout" title="Le dossier MDPH">
              <p>
                {wants("ecole") && ecole !== "simple" ? "Pour un PPS (projet personnalisé de scolarisation), une AESH ou du matériel. " : ""}
                {showAeeh ? "Pour l'AEEH. " : ""}
                {wants("soins") ? "Pour une orientation vers un service de soins comme un SESSAD. " : ""}
                Le même dossier sert à toutes les demandes : cochez-les toutes en une fois.
              </p>
              <ul className="grid gap-1.5">
                <Todo>Le formulaire de demande (Cerfa 15692*01)</Todo>
                <Todo>Le certificat médical (Cerfa 15695), daté de moins d'un an, rempli par le médecin</Todo>
                {wants("ecole") && ecole !== "simple" && (
                  <Todo>Le GEVASCO, rempli avec l'équipe de l'école</Todo>
                )}
                <Todo>Les comptes rendus de bilans (orthophonie, psychomotricité, bilan neuropsychologique…)</Todo>
                <Todo>Une pièce d'identité et un justificatif de domicile</Todo>
                <Todo>Une copie de tout, gardée chez vous</Todo>
              </ul>
              <p className="text-muted-foreground">
                C'est la commission de la MDPH (CDAPH) qui décide, en regardant les difficultés au quotidien. Le
                diagnostic seul ne suffit pas : décrivez des situations concrètes dans le formulaire.
              </p>
            </Card>
          )}

          {showAeeh && (
            <Card tag="Versée par la CAF" title="L'AEEH (allocation d'éducation de l'enfant handicapé)">
              <p>
                Pour un enfant de moins de 20 ans, avec un taux d'incapacité d'au moins 80 %, ou de 50 à 79 % s'il
                est accompagné par un service médico-social, un dispositif de scolarisation adapté, ou suit des
                soins préconisés par la CDAPH.
              </p>
              <p>
                <strong>153,01 € par mois</strong> pour l'AEEH de base. Un complément peut s'ajouter selon les
                dépenses liées au handicap ou si un parent réduit son activité : de 267,77 € à 1 451,45 € par mois
                au total selon la catégorie.
              </p>
              <p className="text-xs text-muted-foreground">Montants : {SOURCE}. Ils changent chaque année.</p>
            </Card>
          )}

          {wants("argent") && !moins20 && (
            <Card tag="Après 20 ans" title="L'AEEH s'arrête à 20 ans">
              <p>
                D'autres aides existent pour les jeunes adultes, comme l'AAH. Elles se demandent aussi avec le
                dossier MDPH.
              </p>
            </Card>
          )}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Repères généraux préparés avec Tokō · toko.battistella.ovh/outils. Chaque MDPH a ses délais ; votre MDPH
          ou votre CAF reste la référence pour votre situation.
        </p>
      </div>

      <div className="outil-print-controls mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <div className="flex flex-col items-start gap-3">
          <PrintButton outil="mdph" />
          <p className="text-sm text-muted-foreground">Imprimez la liste et cochez au fur et à mesure.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/ressources/lexique"
            className="group rounded-[1.75rem] bg-card p-6 ring-1 ring-foreground/10 hover:ring-brand/40"
          >
            <p className="font-heading text-lg font-extrabold tracking-tight">Un sigle vous échappe ?</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">PAP, PPS, GEVASCO, CDAPH… expliqués en une phrase.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-strong">
              Ouvrir le lexique
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </Link>
          <Link
            to="/outils/fiche-enfant"
            className="group rounded-[1.75rem] bg-card p-6 ring-1 ring-foreground/10 hover:ring-brand/40"
          >
            <p className="font-heading text-lg font-extrabold tracking-tight">Pour l'équipe de l'école</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Une page pour présenter votre enfant : ce qui l'aide, ce qui l'apaise.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-strong">
              Préparer la fiche
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
