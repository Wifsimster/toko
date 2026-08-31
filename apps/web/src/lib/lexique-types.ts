/**
 * Lexique — les sigles et termes que les parents croisent dans les courriers
 * de l'école, les comptes rendus médicaux et les dossiers MDPH.
 *
 * Objectif produit : lever la charge mentale du jargon. Une définition = une
 * phrase courte, en français courant, sans vocabulaire technique en cascade.
 */

export const LEXIQUE_CATEGORIES = [
  {
    id: "neurodeveloppement",
    label: "Troubles du neurodéveloppement",
  },
  {
    id: "diagnostic",
    label: "Diagnostics et classifications",
  },
  {
    id: "ecole",
    label: "École et aménagements",
  },
  {
    id: "handicap",
    label: "Handicap, droits et aides",
  },
  {
    id: "bilans",
    label: "Bilans et évaluations",
  },
  {
    id: "professionnels",
    label: "Professionnels qui peuvent vous aider",
  },
  {
    id: "structures",
    label: "Structures et dispositifs",
  },
  {
    id: "sante",
    label: "Santé et suivi médical",
  },
] as const;

export type LexiqueCategoryId = (typeof LEXIQUE_CATEGORIES)[number]["id"];

export interface LexiqueTerm {
  /** Sigle ou terme court affiché en pastille : « MDPH », « Bilan orthophonique ». */
  term: string;
  /** Libellé complet. Vide quand le terme n'est pas un sigle. */
  label?: string;
  /** Définition en une à deux phrases courtes, sans jargon. */
  definition: string;
  category: LexiqueCategoryId;
  /** Termes alternatifs pris en compte par la recherche. */
  aliases?: string[];
  /** Article de la base de connaissances à lire pour aller plus loin. */
  relatedSlug?: string;
}
