import type { MoState } from "@focusflow/mo";

export type OutilId =
  | "quiz"
  | "carnet-de-sommeil"
  | "fiche-enfant"
  | "preparer-rendez-vous"
  | "routine"
  | "plan-de-crise"
  | "lexique";

export interface Outil {
  id: OutilId;
  to:
    | "/quiz"
    | "/outils/carnet-de-sommeil"
    | "/outils/fiche-enfant"
    | "/outils/preparer-rendez-vous"
    | "/outils/routine"
    | "/ressources/plan-de-crise"
    | "/ressources/lexique";
  title: string;
  description: string;
  meta: string;
  mo: MoState;
  tile: string;
}

export const OUTILS: readonly Outil[] = [
  {
    id: "quiz",
    to: "/quiz",
    title: "Questionnaires de repérage",
    description: "TDAH, opposition, autisme : quelques questions pour y voir plus clair, pour vous ou votre enfant.",
    meta: "3 à 8 min · rien n'est envoyé",
    mo: "enquete",
    tile: "bg-surface-lavender",
  },
  {
    id: "carnet-de-sommeil",
    to: "/outils/carnet-de-sommeil",
    title: "Carnet de sommeil",
    description: "Deux semaines de coucher, d'endormissement et de réveil à noter, prêtes à montrer au médecin.",
    meta: "À imprimer · 2 semaines",
    mo: "theme-sommeil",
    tile: "bg-surface-sky",
  },
  {
    id: "routine",
    to: "/outils/routine",
    title: "Routine en images",
    description: "Les étapes du matin ou du soir, dans l'ordre, en grandes images à afficher, avec des cases à cocher.",
    meta: "À imprimer · 3 min",
    mo: "theme-cadre",
    tile: "bg-surface-honey",
  },
  {
    id: "fiche-enfant",
    to: "/outils/fiche-enfant",
    title: "Mon enfant en une page",
    description: "Pour l'enseignant ou l'AESH : ce qui aide votre enfant, ce qui est difficile, ce qui l'apaise.",
    meta: "À remplir et imprimer · 5 min",
    mo: "theme-ecole",
    tile: "bg-surface-rose",
  },
  {
    id: "preparer-rendez-vous",
    to: "/outils/preparer-rendez-vous",
    title: "Préparer le rendez-vous",
    description: "Ce que vous avez observé, le traitement, vos questions et les documents à apporter chez le médecin.",
    meta: "À remplir et imprimer · 5 min",
    mo: "theme-soins",
    tile: "bg-surface-mint",
  },
  {
    id: "plan-de-crise",
    to: "/ressources/plan-de-crise",
    title: "Plan de crise",
    description: "Les signes de montée, vos gestes, ce que vous ne faites plus : une page à remplir au calme et à afficher.",
    meta: "À imprimer · 1 page",
    mo: "theme-emotions",
    tile: "bg-surface-peach",
  },
  {
    id: "lexique",
    to: "/ressources/lexique",
    title: "Lexique des sigles",
    description: "MDPH, PAP, AESH, GEVASCO… Chaque sigle de l'école et du médical expliqué en une phrase.",
    meta: "Recherche rapide",
    mo: "theme-comprendre",
    tile: "bg-surface-sky",
  },
];
