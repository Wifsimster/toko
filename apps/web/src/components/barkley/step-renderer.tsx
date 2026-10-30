import { useTranslation } from "react-i18next";
import {
    BookOpen,
    CheckCircle2,
    Dumbbell,
    Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { cn } from "@/lib/utils";
import type { StepContent, Callout as CalloutData } from "@/lib/barkley-content";
import { BarkleySectionScene } from "./barkley-section-scene";

const calloutVariantMap = {
    tip: "info",
    warning: "warning",
    example: "success",
} as const;

const PROSE = "text-base leading-7 text-foreground/85";

function Prose({ text, className }: { text: string; className?: string }) {
    const paragraphs = text.split("\n\n");

    return (
        <div className={cn("space-y-4", PROSE, className)}>
            {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
        </div>
    );
}

function SectionHeading({
    icon: Icon,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}) {
    return (
        <h3 className="flex items-baseline gap-2 text-lg font-semibold tracking-tight text-balance">
            <Icon className="size-4 shrink-0 translate-y-0.5 text-brand-strong" />
            {children}
        </h3>
    );
}

function CalloutBlock({ callout }: { callout: CalloutData }) {
    return (
        <Callout variant={calloutVariantMap[callout.type]} className="mt-4">
            <p className="text-[0.9375rem] leading-6">{callout.text}</p>
        </Callout>
    );
}

function SectionBlock({
    heading,
    body,
    callout,
    icon,
    scene,
}: {
    heading: string;
    body: string;
    callout?: CalloutData;
    icon: React.ComponentType<{ className?: string }>;
    scene: React.ReactNode;
}) {
    return (
        <section className="space-y-3">
            <SectionHeading icon={icon}>{heading}</SectionHeading>
            {scene}
            <Prose text={body} />
            {callout && <CalloutBlock callout={callout} />}
        </section>
    );
}

export function StepRenderer({ content }: { content: StepContent }) {
    const { t } = useTranslation();

    return (
        <div className="space-y-10">
            <Prose
                text={content.intro}
                className="text-[1.0625rem] leading-8 text-foreground/90"
            />

            <SectionBlock
                heading={content.understand.heading}
                body={content.understand.body}
                callout={content.understand.callout}
                icon={BookOpen}
                scene={<BarkleySectionScene stepNumber={content.stepNumber} section="understand" />}
            />

            <SectionBlock
                heading={content.technique.heading}
                body={content.technique.body}
                callout={content.technique.callout}
                icon={Dumbbell}
                scene={<BarkleySectionScene stepNumber={content.stepNumber} section="technique" />}
            />

            <section className="space-y-3">
                <SectionHeading icon={Users}>
                    {t("barkley.formation.scenarios")}
                </SectionHeading>
                <BarkleySectionScene stepNumber={content.stepNumber} section="scenarios" />
                <div className="space-y-3">
                    {content.scenarios.map((scenario) => (
                        <Card key={scenario.title} className="border-dashed">
                            <CardContent className="space-y-2 py-4">
                                <p className="font-medium">{scenario.title}</p>
                                <Prose text={scenario.body} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <SectionHeading icon={CheckCircle2}>
                    {t("barkley.formation.keyTakeaways")}
                </SectionHeading>
                <ul className={cn("space-y-2.5", PROSE)}>
                    {content.keyTakeaways.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand/60" />
                            {item}
                        </li>
                    ))}
                </ul>
            </section>

            <div className="space-y-3">
                <BarkleySectionScene stepNumber={content.stepNumber} section="practice" />
                <Callout variant="success" icon={false}>
                    <p className="font-medium">
                        {t("barkley.formation.practiceExercise")}
                    </p>
                    <Prose
                        text={content.practiceExercise}
                        className="mt-2 text-[0.9375rem] leading-6 text-inherit"
                    />
                </Callout>
            </div>
        </div>
    );
}
