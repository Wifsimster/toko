import type { ThemeMoState } from "@focusflow/mo/themes";

const ARTICLE_THEMES: Readonly<Record<string, ThemeMoState>> = {
  "crise-tdah-enfant-guide-complet": "theme-emotions",
  "dysregulation-emotionnelle-tdah": "theme-emotions",
  "co-regulation-parent-enfant-tdah": "theme-emotions",
  "deconnexion-emotionnelle-tdah": "theme-emotions",
  "hypersensibilite-sensorielle-tdah": "theme-emotions",
  "parent-tdah-gerer-mes-propres-crises": "theme-emotions",
  "fonctions-executives-tdah-enfant": "theme-comprendre",
  "tdah-ecrans-ne-causent-pas": "theme-comprendre",
  "motivation-delai-tdah-pourquoi-punition-echoue": "theme-recompenses",
  "troubles-sommeil-tdah-enfant": "theme-sommeil",
  "horloge-interne-tdah-enfant": "theme-sommeil",
  "rentree-scolaire-tdah-enfant": "theme-ecole",
  "retours-enseignant-tdah-enfant": "theme-ecole",
  "apres-le-diagnostic-tdah-parcours-de-soins": "theme-soins",
  "medication-tdah-mythes-parents": "theme-soins",
  "alimentation-tdah-enfant": "theme-soins",
  "mediation-equine-equitation-tdah-enfant": "theme-soins",
  "mini-guide-grands-parents-tdah": "theme-entourage",
  "mini-guide-co-parent-tdah": "theme-entourage",
  "mini-guide-parrains-marraines-tdah": "theme-entourage",
};

const TILE: Record<ThemeMoState, string> = {
  "theme-comprendre": "bg-surface-sky",
  "theme-attention": "bg-surface-mint",
  "theme-consignes": "bg-surface-mint",
  "theme-recompenses": "bg-surface-honey",
  "theme-cadre": "bg-surface-lavender",
  "theme-emotions": "bg-surface-peach",
  "theme-sommeil": "bg-surface-sky",
  "theme-ecole": "bg-surface-honey",
  "theme-soins": "bg-surface-mint",
  "theme-entourage": "bg-surface-rose",
};

export function articleTheme(slug: string): { mo: ThemeMoState; tile: string } {
  const mo = ARTICLE_THEMES[slug] ?? "theme-comprendre";
  return { mo, tile: TILE[mo] };
}
