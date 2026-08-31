import { createFileRoute } from "@tanstack/react-router";
import { FormationStepPage } from "./FormationStepPage";

export const Route = createFileRoute(
    "/_authenticated/barkley/formation/$stepNumber",
)({
    parseParams: (params) => ({
        stepNumber: Number(params.stepNumber),
    }),
    component: FormationStepPage,
    staticData: {
        crumbParent: { to: "/barkley", crumb: "nav.barkley" },
        crumbLabel: ({ params, t }) =>
            t("barkley.formation.stepLabel", { number: params.stepNumber }),
    },
});
