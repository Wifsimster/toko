import type { StepContent } from "./types";
import { step1Content as step1Fr } from "./step-1.fr";
import { step2Content as step2Fr } from "./step-2.fr";
import { step3Content as step3Fr } from "./step-3.fr";
import { step4Content as step4Fr } from "./step-4.fr";
import { step5Content as step5Fr } from "./step-5.fr";
import { step6Content as step6Fr } from "./step-6.fr";
import { step7Content as step7Fr } from "./step-7.fr";
import { step8Content as step8Fr } from "./step-8.fr";
import { step9Content as step9Fr } from "./step-9.fr";
import { step10Content as step10Fr } from "./step-10.fr";

import { step1Content as step1En } from "./step-1.en";
import { step2Content as step2En } from "./step-2.en";
import { step3Content as step3En } from "./step-3.en";
import { step4Content as step4En } from "./step-4.en";
import { step5Content as step5En } from "./step-5.en";
import { step6Content as step6En } from "./step-6.en";
import { step7Content as step7En } from "./step-7.en";
import { step8Content as step8En } from "./step-8.en";
import { step9Content as step9En } from "./step-9.en";
import { step10Content as step10En } from "./step-10.en";

export type { StepContent, ContentSection, Callout, Scenario } from "./types";

const STEPS_FR: Record<number, StepContent> = {
    1: step1Fr,
    2: step2Fr,
    3: step3Fr,
    4: step4Fr,
    5: step5Fr,
    6: step6Fr,
    7: step7Fr,
    8: step8Fr,
    9: step9Fr,
    10: step10Fr,
};

const STEPS_EN: Record<number, StepContent> = {
    1: step1En,
    2: step2En,
    3: step3En,
    4: step4En,
    5: step5En,
    6: step6En,
    7: step7En,
    8: step8En,
    9: step9En,
    10: step10En,
};

const STEPS_BY_LOCALE: Record<string, Record<number, StepContent>> = {
    fr: STEPS_FR,
    en: STEPS_EN,
};

export function getStepContent(
    stepNumber: number,
    locale = "fr",
): StepContent | undefined {
    const steps = STEPS_BY_LOCALE[locale] ?? STEPS_FR;
    return steps[stepNumber];
}

export function getAllStepTitles(
    locale = "fr",
): { stepNumber: number; title: string }[] {
    const steps = STEPS_BY_LOCALE[locale] ?? STEPS_FR;
    return Object.values(steps).map((s) => ({
        stepNumber: s.stepNumber,
        title: s.title,
    }));
}
