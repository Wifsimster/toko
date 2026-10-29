export type Palette = {
  primary: string;
  onPrimary: string;
  brand: string;
  brandStrong: string;
  secondary: string;
  text: string;
  subtext: string;
  muted: string;
  mutedSurface: string;
  border: string;
  card: string;
  bg: string;
  danger: string;
  success: string;
  surfaceMint: string;
  surfacePeach: string;
  surfaceLavender: string;
  surfaceHoney: string;
  surfaceSky: string;
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

export const colors: Palette = {
  primary: "#1e2a2e",
  onPrimary: "#fbf6ee",
  brand: "#358891",
  brandStrong: "#23676e",
  secondary: "#dcefe8",
  text: "#1e2a2e",
  subtext: "#404a4c",
  muted: "#4f585e",
  mutedSurface: "#f3ece1",
  border: "#e8e0d3",
  card: "#fffdf9",
  bg: "#fbf6ee",
  danger: "#c53637",
  success: "#10b981",
  surfaceMint: "#dcefe8",
  surfacePeach: "#fbe1cf",
  surfaceLavender: "#e6e2f4",
  surfaceHoney: "#f7e8c6",
  surfaceSky: "#dce9f2",
  surfaceRose: "#f6dedb",
  infoSurface: "rgba(129, 140, 248, 0.10)",
  infoBorder: "rgba(129, 140, 248, 0.30)",
  infoFg: "#4a50b5",
  tipSurface: "#eef4ee",
  tipBorder: "#c9d9c9",
  tipFg: "#3a5339",
  successSurface: "rgba(16, 185, 129, 0.14)",
  successBorder: "rgba(16, 185, 129, 0.32)",
  successFg: "#025f44",
  alertSurface: "rgba(245, 158, 11, 0.14)",
  alertBorder: "rgba(245, 158, 11, 0.35)",
  alertFg: "#904106",
  dangerSurface: "rgba(244, 63, 94, 0.14)",
  dangerBorder: "rgba(244, 63, 94, 0.32)",
  dangerFg: "#980c2e",
  chevron: "#8c8780",
};

export function useTheme(): Palette {
  return colors;
}
