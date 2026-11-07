import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/shared/brand-logo";
import { useSeoHead } from "@/hooks/use-seo-head";
import {
  ChipChoices,
  PrintBlock,
  PrintButton,
  ToolHero,
  ToolStep,
  ToolTextarea,
  toggleIn,
} from "@/components/outils/tool-layout";

const AIDE = [
  "Une consigne à la fois",
  "Consigne écrite ou en image",
  "Place près de l'adulte",
  "Loin de la fenêtre et de la porte",
  "Une pause pour bouger",
  "Un minuteur visuel",
  "Prévenir avant un changement",
  "Féliciter l'effort, tout de suite",
  "Un objet à manipuler",
] as const;

const DIFFICULTE = [
  "Le bruit",
  "Attendre son tour",
  "Plusieurs consignes d'un coup",
  "Les changements imprévus",
  "Les longs moments assis",
  "La copie longue",
  "Les transitions (récré, cantine)",
] as const;

const APAISE = [
  "S'isoler quelques minutes",
  "Respirer avec l'adulte",
  "Boire un verre d'eau",
  "Bouger, marcher",
  "Une voix calme et peu de mots",
  "Un objet doudou ou à serrer",
] as const;

export function FicheEnfantPage() {
  useSeoHead({
    title: "Fiche « mon enfant en une page » pour l'enseignant ou l'AESH | Tokō",
    description:
      "Modèle gratuit à remplir et imprimer : ce qui aide votre enfant TDAH, ce qui le met en difficulté, les signes qu'il déborde, ce qui l'apaise. Pour l'enseignant, l'AESH, le centre de loisirs.",
    canonical: "https://toko.battistella.ovh/outils/fiche-enfant",
  });

  const nameId = useId();
  const classId = useId();
  const [name, setName] = useState("");
  const [classe, setClasse] = useState("");
  const [aime, setAime] = useState("");
  const [aide, setAide] = useState<string[]>([]);
  const [aideLibre, setAideLibre] = useState("");
  const [difficulte, setDifficulte] = useState<string[]>([]);
  const [signes, setSignes] = useState("");
  const [apaise, setApaise] = useState<string[]>([]);
  const [amenagements, setAmenagements] = useState("");
  const [contact, setContact] = useState("");
  const trimmed = name.trim();

  return (
    <div className="outil-print min-h-dvh bg-background">
      <div className="outil-print-controls mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <ToolHero
          tile="bg-surface-honey"
          mo="theme-ecole"
          eyebrow="Gratuit · à remplir et imprimer"
          title="Mon enfant en une page"
          intro="Pour l'enseignant, l'AESH ou le centre de loisirs : ce qui aide votre enfant, ce qui le met en difficulté, ce qui l'apaise. Cochez, complétez, imprimez."
        />

        <div className="mt-8 grid gap-5">
          <ToolStep index={1} title="Votre enfant" hint="Facultatif. Laissez vide pour l'écrire à la main.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={nameId}>Prénom</Label>
                <Input id={nameId} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="off" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={classId}>Classe ou âge</Label>
                <Input id={classId} value={classe} onChange={(e) => setClasse(e.target.value)} maxLength={40} autoComplete="off" />
              </div>
            </div>
            <ToolTextarea label="Ce qu'il ou elle aime, ses points forts" value={aime} onChange={setAime} rows={2} />
          </ToolStep>

          <ToolStep index={2} title="Ce qui l'aide" hint="Touchez ce qui marche avec votre enfant.">
            <ChipChoices legend="Ce qui l'aide" options={AIDE} selected={aide} onToggle={(o) => setAide((l) => toggleIn(l, o))} />
            <ToolTextarea label="Autre chose qui l'aide" value={aideLibre} onChange={setAideLibre} rows={2} />
          </ToolStep>

          <ToolStep index={3} title="Ce qui est difficile pour lui ou elle">
            <ChipChoices
              legend="Ce qui est difficile"
              options={DIFFICULTE}
              selected={difficulte}
              onToggle={(o) => setDifficulte((l) => toggleIn(l, o))}
            />
          </ToolStep>

          <ToolStep index={4} title="Quand ça monte" hint="Les signes qu'il ou elle commence à déborder, et ce qui l'apaise.">
            <ToolTextarea
              label="Les signes à repérer"
              value={signes}
              onChange={setSignes}
              placeholder="Il se lève sans arrêt, parle plus fort, se cache sous sa capuche…"
            />
            <ChipChoices legend="Ce qui l'apaise" options={APAISE} selected={apaise} onToggle={(o) => setApaise((l) => toggleIn(l, o))} />
          </ToolStep>

          <ToolStep index={5} title="Le cadre">
            <ToolTextarea
              label="Aménagements déjà en place"
              value={amenagements}
              onChange={setAmenagements}
              placeholder="PAP, PPS, AESH, tiers temps…"
              rows={2}
            />
            <ToolTextarea label="Pour me joindre" value={contact} onChange={setContact} rows={2} />
          </ToolStep>
        </div>

        <div className="mt-8 flex flex-col items-start gap-3">
          <PrintButton outil="fiche-enfant" />
          <p className="text-sm text-muted-foreground">
            Rien n'est envoyé ni enregistré : imprimez ou enregistrez en PDF avant de fermer la page.
          </p>
        </div>

        <h2 className="mt-12 font-heading text-lg font-extrabold tracking-tight">Aperçu de la fiche</h2>
      </div>

      <div className="fiche-doc mx-auto mt-4 max-w-3xl px-4 pb-10 sm:px-6">
        <div className="rounded-[1.75rem] bg-card p-6 ring-1 ring-foreground/10 sm:p-8 print:rounded-none print:bg-white print:p-0 print:ring-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-heading text-2xl font-extrabold tracking-tight">
                {trimmed ? `${trimmed} en une page` : "Mon enfant en une page"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {classe.trim() ? `${classe.trim()} · ` : ""}Merci de prendre deux minutes pour lire cette fiche.
              </p>
            </div>
            <BrandLogo className="size-8 shrink-0 rounded-lg" />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
            <PrintBlock title="Ses points forts" text={aime} lines={2} />
            <PrintBlock title="Ce qui l'aide" items={[...aide, ...(aideLibre.trim() ? [aideLibre.trim()] : [])]} />
            <PrintBlock title="Ce qui est difficile" items={difficulte} />
            <PrintBlock title="Les signes que ça monte" text={signes} />
            <PrintBlock title="Ce qui l'apaise" items={apaise} />
            <PrintBlock title="Aménagements en place" text={amenagements} lines={2} />
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <PrintBlock title="Pour me joindre" text={contact} lines={1} />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Fiche préparée avec Tokō · toko.battistella.ovh/outils</p>
        </div>
      </div>

      <div className="outil-print-controls mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <div className="rounded-[1.75rem] bg-card p-6 ring-1 ring-foreground/10">
          <p className="font-heading text-lg font-extrabold tracking-tight">Parler avec l'enseignant</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Que répondre à « il se disperse » ou « il ne finit pas son travail » ? Ce que ces remarques décrivent vraiment.
          </p>
          <Link
            to="/ressources/$slug"
            params={{ slug: "retours-enseignant-tdah-enfant" }}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-strong hover:underline"
          >
            Lire l'article
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
