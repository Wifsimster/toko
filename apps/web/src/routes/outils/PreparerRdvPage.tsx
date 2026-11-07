import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SignupCtaLink } from "@/components/shared/signup-cta-link";
import { useSeoHead } from "@/hooks/use-seo-head";
import { cn } from "@/lib/utils";
import {
  ChipChoices,
  PrintBlock,
  PrintButton,
  ToolHero,
  ToolStep,
  ToolTextarea,
  toggleIn,
} from "@/components/outils/tool-layout";

const DOMAINES = [
  "Le sommeil",
  "L'appétit",
  "L'humeur",
  "Les crises",
  "L'école",
  "Les copains",
  "La concentration",
  "Les effets du traitement",
] as const;

const QUESTIONS = [
  "Faut-il ajuster le traitement ?",
  "Quels bilans faire, et chez qui ?",
  "Peut-on demander un PAP ou un dossier MDPH ?",
  "Que dire à l'école ?",
  "Que faire pour le sommeil ?",
  "Quand se revoir ?",
] as const;

const DOCUMENTS = [
  "Le carnet de santé",
  "Les ordonnances en cours",
  "Le carnet de sommeil",
  "Les mots ou bulletins de l'école",
  "Les comptes rendus de bilans",
  "Ce questionnaire imprimé",
] as const;

export function PreparerRdvPage() {
  useSeoHead({
    title: "Préparer le rendez-vous chez le médecin de votre enfant TDAH | Tokō",
    description:
      "Liste gratuite à remplir et imprimer avant le rendez-vous chez le pédiatre ou le pédopsychiatre : ce que vous avez observé, le traitement, vos questions, les documents à apporter.",
    canonical: "https://toko.battistella.ovh/outils/preparer-rendez-vous",
  });

  const dateId = useId();
  const proId = useId();
  const [date, setDate] = useState("");
  const [pro, setPro] = useState("");
  const [priorite, setPriorite] = useState("");
  const [domaines, setDomaines] = useState<string[]>([]);
  const [observations, setObservations] = useState("");
  const [traitement, setTraitement] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionsLibres, setQuestionsLibres] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);

  const allQuestions = [
    ...questions,
    ...questionsLibres
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean),
  ];

  return (
    <div className="outil-print min-h-dvh bg-background">
      <div className="outil-print-controls mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <ToolHero
          tile="bg-surface-mint"
          mo="theme-soins"
          eyebrow="Gratuit · à remplir et imprimer"
          title="Préparer le rendez-vous"
          intro="Quinze minutes de consultation passent vite. Notez avant ce que vous avez vu et ce que vous voulez demander : vous repartirez avec vos réponses."
        />

        <div className="mt-8 grid gap-5">
          <ToolStep index={1} title="Le rendez-vous" hint="Facultatif.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={dateId}>Date</Label>
                <Input id={dateId} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={proId}>Avec qui</Label>
                <Input
                  id={proId}
                  value={pro}
                  onChange={(e) => setPro(e.target.value)}
                  placeholder="Pédiatre, pédopsychiatre…"
                  maxLength={60}
                  autoComplete="off"
                />
              </div>
            </div>
            <ToolTextarea
              label="La chose la plus importante à dire"
              value={priorite}
              onChange={setPriorite}
              rows={2}
              placeholder="Si vous n'avez le temps de dire qu'une chose…"
            />
          </ToolStep>

          <ToolStep index={2} title="Ce que vous avez observé" hint="Depuis le dernier rendez-vous. Touchez ce qui a changé.">
            <ChipChoices
              legend="Ce qui a changé"
              options={DOMAINES}
              selected={domaines}
              onToggle={(o) => setDomaines((l) => toggleIn(l, o))}
            />
            <ToolTextarea
              label="Un exemple récent"
              value={observations}
              onChange={setObservations}
              placeholder="Mardi, il s'est endormi à 23 h alors qu'il était couché à 20 h 30…"
            />
          </ToolStep>

          <ToolStep index={3} title="Le traitement" hint="Si votre enfant en prend un.">
            <ToolTextarea
              label="Nom, dose, heure, ce que vous remarquez"
              value={traitement}
              onChange={setTraitement}
              rows={2}
            />
          </ToolStep>

          <ToolStep index={4} title="Vos questions">
            <ChipChoices
              legend="Questions"
              options={QUESTIONS}
              selected={questions}
              onToggle={(o) => setQuestions((l) => toggleIn(l, o))}
            />
            <ToolTextarea
              label="Vos autres questions, une par ligne"
              value={questionsLibres}
              onChange={setQuestionsLibres}
            />
          </ToolStep>

          <ToolStep index={5} title="À apporter">
            <ChipChoices
              legend="Documents à apporter"
              options={DOCUMENTS}
              selected={documents}
              onToggle={(o) => setDocuments((l) => toggleIn(l, o))}
            />
          </ToolStep>
        </div>

        <div className="mt-8 flex flex-col items-start gap-3">
          <PrintButton outil="preparer-rendez-vous" />
          <p className="text-sm text-muted-foreground">
            Rien n'est envoyé ni enregistré : imprimez ou enregistrez en PDF avant de fermer la page.
          </p>
        </div>

        <h2 className="mt-12 font-heading text-lg font-extrabold tracking-tight">Aperçu</h2>
      </div>

      <div className="fiche-doc mx-auto mt-4 max-w-3xl px-4 pb-10 sm:px-6">
        <div className="rounded-[1.75rem] bg-card p-6 ring-1 ring-foreground/10 sm:p-8 print:rounded-none print:bg-white print:p-0 print:ring-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-heading text-2xl font-extrabold tracking-tight">Pour le rendez-vous</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {[
                  date &&
                    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
                      new Date(`${date}T12:00:00`),
                    ),
                  pro.trim(),
                ]
                  .filter(Boolean)
                  .join(" · ") || "Date et professionnel : ____________________"}
              </p>
            </div>
            <BrandLogo className="size-8 shrink-0 rounded-lg" />
          </div>
          <div className="mt-6 grid gap-6">
            <PrintBlock title="Le plus important" text={priorite} lines={2} />
            <div className="grid gap-6 sm:grid-cols-2 print:grid-cols-2">
              <PrintBlock title="Ce qui a changé" items={domaines} />
              <PrintBlock title="Un exemple récent" text={observations} />
            </div>
            <PrintBlock title="Le traitement" text={traitement} lines={2} />
            <PrintBlock title="Mes questions" items={allQuestions} lines={4} />
            <PrintBlock title="Ce que le médecin m'a répondu" lines={5} />
            <PrintBlock title="À apporter" items={documents} lines={2} />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Préparé avec Tokō · toko.battistella.ovh/outils</p>
        </div>
      </div>

      <div className="outil-print-controls mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <div className="rounded-[1.75rem] bg-surface-mint p-6">
          <p className="font-heading text-lg font-extrabold tracking-tight">Un rapport prêt pour chaque rendez-vous</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            Notez la journée en 30 secondes dans Tokō : le rapport du médecin se prépare tout seul, tendances et traitement compris.
          </p>
          <SignupCtaLink location="outil_preparer_rdv" className={cn(buttonVariants(), "mt-4 gap-2")}>
            Essayer Tokō gratuitement
            <ArrowRight className="size-3.5" aria-hidden />
          </SignupCtaLink>
        </div>
      </div>
    </div>
  );
}
