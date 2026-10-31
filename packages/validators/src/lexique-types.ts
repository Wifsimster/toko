export const LEXIQUE_CATEGORIES = [
  {
    id: "neurodeveloppement",
    label: "Troubles du neurodéveloppement",
    shortLabel: "Neurodéveloppement",
  },
  {
    id: "diagnostic",
    label: "Diagnostics et classifications",
    shortLabel: "Diagnostics",
  },
  {
    id: "ecole",
    label: "École et aménagements",
    shortLabel: "École",
  },
  {
    id: "handicap",
    label: "Handicap, droits et aides",
    shortLabel: "Handicap et aides",
  },
  {
    id: "bilans",
    label: "Bilans et évaluations",
    shortLabel: "Bilans",
  },
  {
    id: "professionnels",
    label: "Professionnels qui peuvent vous aider",
    shortLabel: "Professionnels",
  },
  {
    id: "structures",
    label: "Structures et dispositifs",
    shortLabel: "Structures",
  },
  {
    id: "sante",
    label: "Santé et suivi médical",
    shortLabel: "Santé",
  },
] as const;

export type LexiqueCategoryId = (typeof LEXIQUE_CATEGORIES)[number]["id"];

export interface LexiqueTerm {
  term: string;
  label?: string;
  definition: string;
  category: LexiqueCategoryId;
  aliases?: string[];
  relatedSlug?: string;
}
