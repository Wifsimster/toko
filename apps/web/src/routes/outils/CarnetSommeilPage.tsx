import { useId, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SignupCtaLink } from "@/components/shared/signup-cta-link";
import { Mo } from "@/components/mo/mo";
import { useSeoHead } from "@/hooks/use-seo-head";
import { umamiTrack } from "@/lib/umami";
import { cn } from "@/lib/utils";

const CANONICAL = "https://toko.battistella.ovh/outils/carnet-de-sommeil";

const ROWS: { label: string; hint?: string; choices?: string[] }[] = [
  { label: "Coucher", hint: "lumière éteinte" },
  { label: "Endormi vers", hint: "à peu près" },
  { label: "Réveils la nuit", hint: "combien, combien de temps" },
  { label: "Réveil le matin" },
  { label: "Le lever", choices: ["facile", "moyen", "difficile"] },
  { label: "Écrans l'heure d'avant", choices: ["oui", "non"] },
  { label: "Dehors à la lumière du jour", choices: ["oui", "non"] },
  { label: "Traitement ou mélatonine", hint: "heure" },
  { label: "En forme / fatigué", hint: "à quel moment de la journée" },
  { label: "Notes", hint: "piste essayée, sieste, journée chargée…" },
];

function todayIso(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function daysFrom(iso: string, count: number): Date[] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const start = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date();
  return Array.from({ length: count }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

const dayName = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const dayDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

function Week({ days, index }: { days: Date[]; index: number }) {
  return (
    <section className="carnet-semaine mt-8 first:mt-0">
      <h2 className="font-heading text-lg font-extrabold tracking-tight">Semaine {index + 1}</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl ring-1 ring-foreground/10 print:overflow-visible print:rounded-none print:ring-0">
        <table className="carnet-table w-full min-w-[760px] border-collapse text-left text-sm print:min-w-0">
          <thead>
            <tr>
              <th scope="col" className="w-44 bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
                <span className="sr-only">Repère</span>
              </th>
              {days.map((day) => (
                <th
                  key={day.toISOString()}
                  scope="col"
                  className="border-l border-border bg-muted/60 px-2 py-2 text-center font-heading font-bold"
                >
                  <span className="block text-xs font-semibold uppercase text-muted-foreground">
                    {dayName.format(day).replace(".", "")}
                  </span>
                  {dayDate.format(day).replace(".", "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="px-3 py-2 align-top font-semibold">
                  {row.label}
                  {row.hint && <span className="block text-xs font-normal text-muted-foreground">{row.hint}</span>}
                </th>
                {days.map((day) => (
                  <td key={day.toISOString()} className="h-12 border-l border-border px-2 py-1.5 align-top">
                    {row.choices && (
                      <span className="flex flex-col gap-0.5 text-[0.7rem] leading-tight text-muted-foreground">
                        {row.choices.map((choice) => (
                          <span key={choice} className="inline-flex items-center gap-1">
                            <span aria-hidden className="inline-block size-2.5 rounded-full border border-foreground/40" />
                            {choice}
                          </span>
                        ))}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CarnetSommeilPage() {
  useSeoHead({
    title: "Carnet de sommeil enfant à imprimer (2 semaines) | Tokō",
    description:
      "Carnet de sommeil gratuit à imprimer pour votre enfant : heure du coucher, endormissement, réveils, écrans, lumière du matin. Deux semaines à montrer au médecin.",
    canonical: CANONICAL,
  });

  const nameId = useId();
  const startId = useId();
  const [name, setName] = useState("");
  const [start, setStart] = useState(todayIso);
  const days = useMemo(() => daysFrom(start, 14), [start]);
  const trimmed = name.trim();

  const print = () => {
    umamiTrack("outil-utilise", { outil: "carnet-de-sommeil" });
    window.print();
  };

  return (
    <div className="outil-print min-h-dvh bg-background">
      <div className="outil-print-controls mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link
          to="/outils"
          className="-my-3 inline-flex items-center gap-1.5 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Tous les outils
        </Link>

        <header className="mt-4 flex flex-col-reverse gap-4 rounded-[2rem] bg-surface-sky px-6 py-8 sm:flex-row sm:items-center sm:gap-8 sm:px-10 sm:py-10">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">
              Gratuit · à imprimer
            </p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl">
              Carnet de sommeil
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/80">
              Deux semaines à remplir chaque matin, en deux minutes. Le
              médecin y voit d'un coup d'œil l'heure du coucher, de
              l'endormissement et du réveil.
            </p>
            <div className="mt-6 grid max-w-xl gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={nameId}>Prénom de l'enfant (facultatif)</Label>
                <Input
                  id={nameId}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  maxLength={40}
                  className="bg-card"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={startId}>Premier jour</Label>
                <Input
                  id={startId}
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value || todayIso())}
                  className="bg-card"
                />
              </div>
            </div>
            <Button size="lg" onClick={print} className="mt-6 gap-2">
              <Printer className="size-4" aria-hidden />
              Imprimer ou enregistrer en PDF
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">
              Rien n'est envoyé : le carnet est préparé sur votre appareil.
            </p>
          </div>
          <Mo state="theme-sommeil" size={112} className="sm:hidden" />
          <Mo state="theme-sommeil" size={184} className="hidden sm:inline-block" />
        </header>
      </div>

      <div className="carnet-sommeil mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-2xl font-extrabold tracking-tight">
              {trimmed ? `Le sommeil de ${trimmed}` : "Carnet de sommeil"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Du {dayDate.format(days[0])} au {dayDate.format(days[13])} · à remplir chaque matin, sans chercher la précision à la minute.
            </p>
          </div>
          <BrandLogo className="size-8 shrink-0 rounded-lg" />
        </div>
        <div className="mt-6">
          <Week days={days.slice(0, 7)} index={0} />
          <Week days={days.slice(7, 14)} index={1} />
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Carnet préparé avec Tokō · toko.battistella.ovh/outils. Il aide à
          observer, il ne remplace pas l'avis d'un médecin.
        </p>
      </div>

      <div className="outil-print-controls mx-auto max-w-5xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] bg-card p-6 ring-1 ring-foreground/10">
            <p className="font-heading text-lg font-extrabold tracking-tight">Comprendre ce que vous notez</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Chez une partie des enfants TDAH, l'horloge interne est réglée plus tard. Ce que la recherche a montré, et quatre pistes à essayer.
            </p>
            <Link
              to="/ressources/$slug"
              params={{ slug: "horloge-interne-tdah-enfant" }}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-strong hover:underline"
            >
              Lire l'article sur l'horloge interne
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="rounded-[1.75rem] bg-surface-mint p-6">
            <p className="font-heading text-lg font-extrabold tracking-tight">Le noter sur votre téléphone</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              Dans Tokō, le sommeil se note chaque matin et se retrouve dans le rapport à montrer au médecin.
            </p>
            <SignupCtaLink
              location="outil_carnet_sommeil"
              className={cn(buttonVariants(), "mt-4 gap-2")}
            >
              Essayer Tokō gratuitement
              <ArrowRight className="size-3.5" aria-hidden />
            </SignupCtaLink>
          </div>
        </div>
      </div>
    </div>
  );
}
