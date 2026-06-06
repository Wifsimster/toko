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
  chevron: string;
};

export const lightColors: Palette = {
  brand: "#358891",
  action: "#358891",
  secondary: "#e1efe5",
  text: "#221812",
  subtext: "#52443b",
  muted: "#6d6059",
  border: "#e6e0d9",
  card: "#fffdfa",
  bg: "#fdf9f4",
  danger: "#cf4040",
  success: "#10b981",
  infoSurface: "#e8f0fe",
  infoBorder: "#c3d4f9",
  infoFg: "#1d4ed8",
  tipSurface: "#faf3d9",
  tipBorder: "#e8d49b",
  tipFg: "#a37e29",
  successSurface: "#d6f3e6",
  successBorder: "#9ad9bd",
  successFg: "#065f46",
  alertSurface: "#fdeccb",
  alertBorder: "#f0c674",
  alertFg: "#92400e",
  chevron: "#a89e93",
};

export const darkColors: Palette = {
  brand: "#74b8c0",
  action: "#74b8c0",
  secondary: "#263129",
  text: "#e2e8f1",
  subtext: "#b6bfcb",
  muted: "#8091a8",
  border: "#2a3346",
  card: "#111a2e",
  bg: "#091123",
  danger: "#f66d67",
  success: "#34d399",
  infoSurface: "#16243f",
  infoBorder: "#2c4a7a",
  infoFg: "#93b4f5",
  tipSurface: "#2a2410",
  tipBorder: "#5a4a1e",
  tipFg: "#e8c574",
  successSurface: "#0f2a20",
  successBorder: "#1e5a44",
  successFg: "#6ee7b7",
  alertSurface: "#2e2410",
  alertBorder: "#6a4e1e",
  alertFg: "#f0c674",
  chevron: "#6b7689",
};

/** Returns the active palette, reacting to the OS light/dark setting. */
export function useTheme(): Palette {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
