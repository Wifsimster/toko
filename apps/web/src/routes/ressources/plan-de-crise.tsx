import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Printer, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeoHead } from "@/hooks/use-seo-head";

export const Route = createFileRoute("/ressources/plan-de-crise")({
    component: PlanDeCrisePage,
});

function PlanDeCrisePage() {
    useSeoHead({
        title: "Mon plan de crise TDAH — modèle à imprimer | Tokō",
        description:
            "Modèle gratuit de plan de crise TDAH à imprimer et afficher. Trois colonnes : signes de montée, mes gestes, ce que je ne fais plus.",
    });

    return (
        <div className="plan-de-crise-page min-h-dvh bg-background">
            {/* Screen-only controls */}
            <div className="plan-de-crise-controls border-b border-border/60 bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
                    <Link
                        to="/ressources/$slug"
                        params={{ slug: "crise-tdah-enfant-guide-complet" }}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Retour au guide
                    </Link>
                    <Button
                        size="default"
                        onClick={() => window.print()}
                        className="gap-2 shadow-sm"
                    >
                        <Printer className="h-4 w-4" />
                        Télécharger en PDF
                    </Button>
                </div>
                <div className="mx-auto max-w-3xl px-4 pb-4">
                    <p className="text-sm text-muted-foreground">
                        Cliquez sur « Télécharger en PDF » pour enregistrer ou imprimer ce
                        plan. Remplissez-le à la main après impression — c'est l'écriture
                        manuscrite qui ancre l'engagement.
                    </p>
                </div>
            </div>

            {/* Printable document */}
            <div className="plan-de-crise-document mx-auto max-w-3xl px-4 py-10">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight">
                            Mon plan de crise
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            À remplir au calme, relire chaque semaine, afficher sur le frigo.
                        </p>
                    </div>
                    <div className="plan-de-crise-logo flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground print:bg-black print:text-white">
                        <Heart className="h-4 w-4" />
                    </div>
                </div>

                {/* Child info */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="plan-de-crise-field">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Prénom de l'enfant
                        </span>
                        <div className="mt-1 h-8 border-b-2 border-dashed border-foreground/30" />
                    </div>
                    <div className="plan-de-crise-field">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Âge
                        </span>
                        <div className="mt-1 h-8 border-b-2 border-dashed border-foreground/30" />
                    </div>
                </div>
                <div className="mt-4 plan-de-crise-field">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Date de rédaction
                    </span>
                    <div className="mt-1 h-8 w-1/2 border-b-2 border-dashed border-foreground/30" />
                </div>

                {/* Three columns */}
                <div className="plan-de-crise-columns mt-10 grid gap-6 md:grid-cols-3 print:grid-cols-3">
                    {/* Column 1 */}
                    <CrisisColumn
                        number={1}
                        title="Signes de montée chez mon enfant"
                        subtitle="Ce qu'il/elle fait, dit, son visage"
                        hint="Ex : voix qui monte, poings serrés, regarde en coin, respiration rapide…"
                        lines={6}
                        color="red"
                    />

                    {/* Column 2 */}
                    <CrisisColumn
                        number={2}
                        title="Ce que je fais"
                        subtitle="Mes gestes concrets"
                        hint="Ex : je respire 3 fois, je baisse la voix, je m'assieds, je propose de l'eau…"
                        lines={6}
                        color="green"
                    />

                    {/* Column 3 */}
                    <CrisisColumn
                        number={3}
                        title="Ce que je ne fais plus jamais"
                        subtitle="Mes engagements"
                        hint="Ex : je ne crie pas, je ne menace pas, je n'isole pas de force, je ne compare pas…"
                        lines={6}
                        color="amber"
                    />
                </div>

                {/* Post-crisis section */}
                <div className="mt-10 rounded-lg border-2 border-dashed border-foreground/20 p-5">
                    <h2 className="font-heading text-lg font-semibold">
                        Après la crise — ma routine de réparation
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Ce que je fais une fois le calme revenu (attendre minimum 20
                        minutes) :
                    </p>
                    <div className="mt-4 space-y-4">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="flex items-start gap-3">
                                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium">
                                    {n}
                                </span>
                                <div className="h-7 flex-1 border-b-2 border-dashed border-foreground/30" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Emergency contacts */}
                <div className="mt-8 rounded-lg border-2 border-dashed border-foreground/20 p-5">
                    <h2 className="font-heading text-lg font-semibold">
                        Mes numéros d'urgence
                    </h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 print:grid-cols-2">
                        {[
                            "Pédopsychiatre / médecin",
                            "Co-parent / personne de confiance",
                            "Association (HyperSupers…)",
                            "Autre",
                        ].map((label) => (
                            <div key={label}>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {label}
                                </span>
                                <div className="mt-1 h-7 border-b-2 border-dashed border-foreground/30" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly review reminder */}
                <div className="mt-8 flex items-start gap-3 rounded-lg bg-muted/40 p-4 print:bg-gray-100">
                    <FileDown className="mt-0.5 h-4 w-4 shrink-0 text-primary print:text-black" />
                    <p className="text-sm leading-relaxed">
                        <strong>Rappel :</strong> relisez ce plan chaque dimanche soir. 5
                        minutes de relecture valent 10 conseils généraux. Ajustez les
                        colonnes au fil des semaines — votre enfant évolue, votre plan
                        aussi.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-10 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
                    <p>
                        Modèle issu du guide{" "}
                        <em>« Crise TDAH chez l'enfant : le guide complet »</em> — toko.app
                    </p>
                    <p className="mt-1">
                        Ce document ne remplace pas l'évaluation médicale. Parlez de votre
                        plan à votre pédopsychiatre.
                    </p>
                </div>
            </div>
        </div>
    );
}

function CrisisColumn({
    number,
    title,
    subtitle,
    hint,
    lines,
    color,
}: {
    number: number;
    title: string;
    subtitle: string;
    hint: string;
    lines: number;
    color: "red" | "green" | "amber";
}) {
    const borderColors = {
        red: "border-t-red-400 print:border-t-red-500",
        green: "border-t-emerald-400 print:border-t-emerald-500",
        amber: "border-t-amber-400 print:border-t-amber-500",
    };

    return (
        <div
            className={`rounded-lg border border-foreground/10 border-t-4 ${borderColors[color]} p-4`}
        >
            <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">
                    {number}
                </span>
                <h3 className="font-heading text-sm font-semibold leading-tight">
                    {title}
                </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            <p className="mt-2 text-3xs italic text-muted-foreground/70">
                {hint}
            </p>
            <div className="mt-3 space-y-3">
                {Array.from({ length: lines }, (_, i) => (
                    <div
                        key={i}
                        className="h-6 border-b border-dashed border-foreground/25"
                    />
                ))}
            </div>
        </div>
    );
}
