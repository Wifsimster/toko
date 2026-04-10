import { useTranslation } from "react-i18next";
import {
    BookOpen,
    CheckCircle2,
    Dumbbell,
    Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import type { StepContent, Callout as CalloutData } from "@/lib/barkley-content";

const calloutVariantMap = {
    tip: "info",
    warning: "warning",
    example: "success",
} as const;

function CalloutBlock({ callout }: { callout: CalloutData }) {
    return (
        <Callout variant={calloutVariantMap[callout.type]} className="mt-3">
            <p>{callout.text}</p>
        </Callout>
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
    callout?: CalloutData;
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
            <Callout variant="success" icon={false}>
                <p className="text-sm font-medium">
                    {t("barkley.formation.practiceExercise")}
                </p>
                <p className="mt-1 text-sm leading-relaxed">
                    {content.practiceExercise}
                </p>
            </Callout>
        </div>
    );
}
