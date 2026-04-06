import { useTranslation } from "react-i18next";
import {
    Lightbulb,
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    Dumbbell,
    Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StepContent, Callout } from "@/lib/barkley-content";

function CalloutBlock({ callout }: { callout: Callout }) {
    const config = {
        tip: {
            icon: Lightbulb,
            border: "border-blue-200 dark:border-blue-800",
            bg: "bg-blue-50/50 dark:bg-blue-950/20",
            text: "text-blue-900 dark:text-blue-200",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        warning: {
            icon: AlertTriangle,
            border: "border-amber-200 dark:border-amber-800",
            bg: "bg-amber-50/50 dark:bg-amber-950/20",
            text: "text-amber-900 dark:text-amber-200",
            iconColor: "text-amber-600 dark:text-amber-400",
        },
        example: {
            icon: BookOpen,
            border: "border-violet-200 dark:border-violet-800",
            bg: "bg-violet-50/50 dark:bg-violet-950/20",
            text: "text-violet-900 dark:text-violet-200",
            iconColor: "text-violet-600 dark:text-violet-400",
        },
    }[callout.type];

    const Icon = config.icon;

    return (
        <div
            className={`mt-3 flex gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed ${config.border} ${config.bg} ${config.text}`}
        >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconColor}`} />
            <p>{callout.text}</p>
        </div>
    );
}

function SectionBlock({
    heading,
    body,
    callout,
    icon: Icon,
}: {
    heading: string;
    body: string;
    callout?: Callout;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <Icon className="h-4 w-4 text-primary" />
                {heading}
            </h3>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {body.split("\n\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                ))}
            </div>
            {callout && <CalloutBlock callout={callout} />}
        </section>
    );
}

export function StepRenderer({ content }: { content: StepContent }) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            {/* Intro */}
            <p className="text-sm leading-relaxed text-muted-foreground">
                {content.intro}
            </p>

            {/* Comprendre */}
            <SectionBlock
                heading={content.understand.heading}
                body={content.understand.body}
                callout={content.understand.callout}
                icon={BookOpen}
            />

            {/* Technique */}
            <SectionBlock
                heading={content.technique.heading}
                body={content.technique.body}
                callout={content.technique.callout}
                icon={Dumbbell}
            />

            {/* Mises en situation */}
            <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                    <Users className="h-4 w-4 text-primary" />
                    {t("barkley.formation.scenarios")}
                </h3>
                <div className="space-y-3">
                    {content.scenarios.map((scenario, i) => (
                        <Card key={i} className="border-dashed">
                            <CardContent className="py-3">
                                <p className="text-sm font-medium">{scenario.title}</p>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    {scenario.body}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* A retenir */}
            <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {t("barkley.formation.keyTakeaways")}
                </h3>
                <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                    {content.keyTakeaways.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                            {item}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Exercice pratique */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                    {t("barkley.formation.practiceExercise")}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-emerald-800 dark:text-emerald-300">
                    {content.practiceExercise}
                </p>
            </div>
        </div>
    );
}
