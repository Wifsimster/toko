import type { MoSize } from "./types";

export const MO_SMALL_BELOW_PX = 96;

export function pickMoSize(px: number): MoSize {
  return px < MO_SMALL_BELOW_PX ? "small" : "large";
}
