import type { MoState } from "@focusflow/mo";

export type OutilId = "quiz" | "carnet-de-sommeil" | "plan-de-crise" | "lexique";

export interface Outil {
  id: OutilId;
  to: "/quiz" | "/outils/carnet-de-sommeil" | "/ressources/plan-de-crise" | "/ressources/lexique";
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
    mo: "theme-ecole",
    tile: "bg-surface-honey",
  },
];
