import { useColorScheme } from "react-native";

/**
 * Color palette, light + dark, mirrored from the web design system
 * (apps/web/src/app.css `:root` and `.dark`). Same key set in both themes so
 * components can switch by calling `useTheme()`. Fonts are theme-independent
 * (see `fonts` in components/ui.tsx).
 */
export type Palette = {
  brand: string;
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
// are warm cream (bg/card) with the teal primary; secondary is pale sage. The
// callout surfaces/borders reproduce the web's `color-mix(in oklab, C n%,
// transparent)` as rgba, and the foregrounds its `color-mix(… , black)`.
export const lightColors: Palette = {
  brand: "#358891", // --primary  oklch(0.58 0.08 205)
  action: "#358891",
  secondary: "#e1efe5", // --secondary  oklch(0.94 0.02 155)
  text: "#221812", // --foreground  oklch(0.22 0.02 50)
  subtext: "#3a2a20", // --secondary-foreground  oklch(0.30 0.03 50)
  muted: "#6d6059", // --muted-foreground  oklch(0.50 0.02 50)
  border: "#e6e0d9", // --border  oklch(0.91 0.012 75)
  card: "#fffdfa", // --card  oklch(0.995 0.004 75)
  bg: "#fdf9f4", // --background  oklch(0.985 0.008 75)
  danger: "#cf4040", // --destructive  oklch(0.58 0.18 25)
  success: "#10b981", // --color-status-success
  // info → --color-info-* (base #3b82f6)
  infoSurface: "rgba(59, 130, 246, 0.12)",
  infoBorder: "rgba(59, 130, 246, 0.3)",
  infoFg: "#295fb7",
  // tip → --color-accent-* (brand gold scale)
  tipSurface: "#f3eacb", // accent-100
  tipBorder: "#e8d49b", // accent-200
  tipFg: "#846522", // accent-600
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
  chevron: "#a89e93",
};

// Dark — exact conversions of app.css `.dark`. The web's dark theme is a cool
// blue-navy (hue ~265); mirrored here 1:1. Callout surfaces use the heavier
// dark opacities from `.dark`, foregrounds its `color-mix(… , white)`.
export const darkColors: Palette = {
  brand: "#74b8c0", // --primary  oklch(0.74 0.07 205)
  action: "#74b8c0",
  secondary: "#263129", // --secondary  oklch(0.30 0.02 155)
  text: "#e2e8f1", // --foreground  oklch(0.93 0.013 256)
  subtext: "#b6bfcb", // --secondary-foreground  oklch(0.90 0.015 256)
  muted: "#8091a8", // --muted-foreground  oklch(0.65 0.04 257)
  border: "#293143", // --border  white @10% over --card
  card: "#111a2e", // --card  oklch(0.22 0.042 265)
  bg: "#091123", // --background  oklch(0.18 0.04 265)
  danger: "#f66d67", // --destructive  oklch(0.70 0.17 25)
  success: "#34d399", // --color-status-success (dark tint)
  infoSurface: "rgba(59, 130, 246, 0.18)",
  infoBorder: "rgba(59, 130, 246, 0.4)",
  infoFg: "#98c8fd",
  tipSurface: "rgba(232, 197, 116, 0.14)",
  tipBorder: "rgba(232, 197, 116, 0.3)",
  tipFg: "#e8c574",
  successSurface: "rgba(16, 185, 129, 0.18)",
  successBorder: "rgba(16, 185, 129, 0.42)",
  successFg: "#78e8bb",
  alertSurface: "rgba(245, 158, 11, 0.18)",
  alertBorder: "rgba(245, 158, 11, 0.42)",
  alertFg: "#fcd55a",
  dangerSurface: "rgba(244, 63, 94, 0.18)",
  dangerBorder: "rgba(244, 63, 94, 0.42)",
  dangerFg: "#fea9b3",
  chevron: "#6b7689",
};

/** Returns the active palette, reacting to the OS light/dark setting. */
export function useTheme(): Palette {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
