import type { SetupThemeId } from "@focusflow/validators";
import type { ParentMoState } from "@focusflow/mo/parent";
import type { ThemeMoState } from "@focusflow/mo/themes";

export const SETUP_WIZARD_STEPS = 2;

export type SetupChoice = SetupThemeId | "unsure" | null;

export const SETUP_THEME_MO: Record<SetupThemeId, ThemeMoState> = {
  daily: "theme-cadre",
  barkley: "theme-recompenses",
  learn: "theme-comprendre",
  medical: "theme-soins",
};

export const SETUP_UNSURE_MO: ParentMoState = "calme";

export type SetupBack = "skip" | "close" | "wait";

export function setupBack(step: number, busy: boolean): SetupBack {
  if (busy) return "wait";
  return step === 0 ? "skip" : "close";
}
