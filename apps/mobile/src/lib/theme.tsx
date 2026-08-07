import { useColorScheme } from "react-native";

/**
 * Color palette, light + dark, mirrored from the web design system
 * (apps/web/src/app.css `:root` and `.dark`). Same key set in both themes so
 * components can switch by calling `useTheme()`. Fonts are theme-independent
 * (see `fonts` in components/ui.tsx).
 */
export type Palette = {
  brand: string;
  /** Text/icon color that sits on a solid `brand` surface (buttons, chips). */
  onBrand: string;
  action: string;
  secondary: string;
  text: string;
  subtext: string;
  muted: string;
  border: string;
  card: string;
  bg: string;
  danger: string;
  success: string;
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

// Light — exact conversions of app.css `:root` (OKLCH → sRGB). Core surfaces
// are a near-neutral warm white (bg) and pure white cards, with a refined
// teal primary. Callout hues: info = lavender, tip = sage, alert = amber,
// danger = rose — each role gets its own hue so cards are distinguishable
// at a glance.
export const lightColors: Palette = {
  brand: "#1d7d74", // --primary  oklch(0.53 0.086 186)
  onBrand: "#ffffff",
  action: "#1d7d74",
  secondary: "#e7f2ee", // --secondary  oklch(0.952 0.013 172)
  text: "#23272e", // --foreground  oklch(0.27 0.014 262)
  subtext: "#3d434c", // --secondary-foreground  oklch(0.38 0.017 258)
  muted: "#666c76", // --muted-foreground  oklch(0.53 0.017 261)
  border: "#e8e6e1", // --border  oklch(0.925 0.007 89)
  card: "#ffffff", // --card  oklch(1 0 0)
  bg: "#faf9f7", // --background  oklch(0.982 0.003 85)
  danger: "#cf4040", // --destructive  oklch(0.58 0.18 25)
  success: "#10b981", // --color-status-success
  // info → --color-info-* (lavender base #818cf8)
  infoSurface: "rgba(129, 140, 248, 0.10)",
  infoBorder: "rgba(129, 140, 248, 0.30)",
  infoFg: "#4a50b5",
  // tip → sage scale (--color-sage-*)
  tipSurface: "#eef4ee", // sage-50-ish
  tipBorder: "#c9d9c9", // sage-200
  tipFg: "#3a5339", // sage-700
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
  chevron: "#a0a3a8",
};

// Dark — exact conversions of app.css `.dark`. Neutral graphite surfaces
// (chroma ≈ 0.01) instead of the old blue-navy, so the lavender/sage/amber
// callouts and the mint-teal primary read cleanly instead of turning muddy.
// `onBrand` is a deep teal ink: dark mode uses dark-on-light-brand buttons.
export const darkColors: Palette = {
  brand: "#7fd6cb", // --primary  oklch(0.818 0.086 185)
  onBrand: "#08201e", // --primary-foreground  oklch(0.224 0.03 188)
  action: "#7fd6cb",
  secondary: "#232a27", // --secondary  oklch(0.277 0.011 168)
  text: "#e9eaec", // --foreground  oklch(0.937 0.003 265)
  subtext: "#c3c7cd", // --secondary-foreground-ish  oklch(0.828 0.009 258)
  muted: "#9aa1ab", // --muted-foreground  oklch(0.707 0.017 257)
  border: "#2c3037", // --border  white @9% over --card
  card: "#1d2025", // --card  oklch(0.243 0.011 261)
  bg: "#14161a", // --background  oklch(0.20 0.009 264)
  danger: "#f66d67", // --destructive  oklch(0.70 0.17 25)
  success: "#34d399", // --color-status-success (dark tint)
  infoSurface: "rgba(129, 140, 248, 0.16)",
  infoBorder: "rgba(129, 140, 248, 0.38)",
  infoFg: "#b3bafb",
  tipSurface: "rgba(141, 178, 141, 0.14)",
  tipBorder: "rgba(141, 178, 141, 0.32)",
  tipFg: "#a9c9a9",
  successSurface: "rgba(16, 185, 129, 0.18)",
  successBorder: "rgba(16, 185, 129, 0.42)",
  successFg: "#78e8bb",
  alertSurface: "rgba(245, 158, 11, 0.15)",
  alertBorder: "rgba(245, 158, 11, 0.38)",
  alertFg: "#f5c563",
  dangerSurface: "rgba(244, 63, 94, 0.18)",
  dangerBorder: "rgba(244, 63, 94, 0.42)",
  dangerFg: "#fea9b3",
  chevron: "#737a84",
};

/** Returns the active palette, reacting to the OS light/dark setting. */
export function useTheme(): Palette {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
