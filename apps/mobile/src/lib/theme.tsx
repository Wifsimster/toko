/**
 * Palette « Mō », reprise des tokens web (apps/web/src/app.css `:root`, rôles
 * décrits dans DESIGN.md). Un seul thème, clair : pas de mode sombre. Les
 * composants lisent la palette par `useTheme()`.
 *
 * Trois rôles à ne pas mélanger :
 * - `primary` = encre : bouton principal, puce ou segment sélectionné,
 *   anneau de sélection. Texte posé dessus : `onPrimary`.
 * - `brand` = sarcelle #358891 : accents NON textuels (progression, tracés,
 *   filets, puces de liste, icônes décoratives, interrupteurs). 3,84:1 sur
 *   crème, donc jamais de texte.
 * - `brandStrong` = sarcelle texte #23676E : seule sarcelle permise pour du
 *   texte (liens, chiffres, libellés, onglet actif).
 */
export type Palette = {
  /** Encre : action principale et sélection. */
  primary: string;
  /** Texte et icônes posés sur un aplat `primary`. */
  onPrimary: string;
  /** Sarcelle d'accent, jamais pour du texte. */
  brand: string;
  /** Sarcelle pour le texte et les liens. */
  brandStrong: string;
  secondary: string;
  text: string;
  subtext: string;
  muted: string;
  /** Surface calme (web `--muted` / `--accent`). */
  mutedSurface: string;
  border: string;
  card: string;
  bg: string;
  danger: string;
  /** Remplissage seulement : le texte de réussite passe par `successFg`. */
  success: string;
  // Pastels à sens fixe (web `surface-*`), même luminosité. Texte dessus :
  // `text`, `muted` ou `brandStrong`.
  /** Calme, suivi. */
  surfaceMint: string;
  /** Crise, SOS. */
  surfacePeach: string;
  /** Fatigue, Barkley. */
  surfaceLavender: string;
  /** Matins, fierté. */
  surfaceHoney: string;
  /** Soir. */
  surfaceSky: string;
  /** Sens pas encore fixé : ne pas l'utiliser avant décision. */
  surfaceRose: string;
  infoSurface: string;
  infoBorder: string;
  infoFg: string;
  tipSurface: string;
  tipBorder: string;
  tipFg: string;
  successSurface: string;
  successBorder: string;
  successFg: string;
  alertSurface: string;
  alertBorder: string;
  alertFg: string;
  dangerSurface: string;
  dangerBorder: string;
  dangerFg: string;
  chevron: string;
};

// Fond crème, cartes presque blanches, encre pour le texte et le bouton
// principal, sarcelle en accent.
export const colors: Palette = {
  primary: "#1e2a2e", // --primary (encre)
  onPrimary: "#fbf6ee", // --primary-foreground (crème)
  brand: "#358891", // --brand
  brandStrong: "#23676e", // --brand-strong
  secondary: "#dcefe8", // --secondary (menthe)
  text: "#1e2a2e", // --foreground
  subtext: "#404a4c", // encre à 85 % sur carte, entre text et muted
  muted: "#4f585e", // --muted-foreground (encre douce)
  mutedSurface: "#f3ece1", // --muted
  border: "#e8e0d3", // --border
  card: "#fffdf9", // --card
  bg: "#fbf6ee", // --background (crème)
  danger: "#c53637", // --destructive  oklch(0.55 0.18 25)
  success: "#10b981", // --color-status-success
  surfaceMint: "#dcefe8",
  surfacePeach: "#fbe1cf",
  surfaceLavender: "#e6e2f4",
  surfaceHoney: "#f7e8c6",
  surfaceSky: "#dce9f2",
  surfaceRose: "#f6dedb",
  // info → --color-info-* (lavande, base #818cf8)
  infoSurface: "rgba(129, 140, 248, 0.10)",
  infoBorder: "rgba(129, 140, 248, 0.30)",
  infoFg: "#4a50b5",
  // tip → sauge (--color-sage-*)
  tipSurface: "#eef4ee",
  tipBorder: "#c9d9c9",
  tipFg: "#3a5339",
  // success callout → --color-success-* (base #10b981)
  successSurface: "rgba(16, 185, 129, 0.14)",
  successBorder: "rgba(16, 185, 129, 0.32)",
  successFg: "#025f44",
  // alert → --color-warning-* (base #f59e0b)
  alertSurface: "rgba(245, 158, 11, 0.14)",
  alertBorder: "rgba(245, 158, 11, 0.35)",
  alertFg: "#904106",
  // danger callout → --color-danger-* (base #f43f5e)
  dangerSurface: "rgba(244, 63, 94, 0.14)",
  dangerBorder: "rgba(244, 63, 94, 0.32)",
  dangerFg: "#980c2e",
  chevron: "#8c8780", // chevron décoratif, gris chaud assorti à la crème
};

/**
 * La palette de l'app. Tokō n'a pas de mode sombre (les dessins de Mō sont
 * pensés pour le crème) : le réglage sombre du téléphone est ignoré.
 */
export function useTheme(): Palette {
  return colors;
}
