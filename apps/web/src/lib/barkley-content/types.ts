export type Callout = {
    type: "tip" | "warning" | "example";
    text: string;
};

export type ContentSection = {
    heading: string;
    body: string;
    callout?: Callout;
};

export type Scenario = {
    title: string;
    body: string;
};

export type StepContent = {
    stepNumber: number;
    title: string;
    intro: string;
    understand: ContentSection;
    technique: ContentSection;
    scenarios: Scenario[];
    keyTakeaways: string[];
    practiceExercise: string;
};
