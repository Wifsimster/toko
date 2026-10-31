import { createContext, useContext } from "react";

export const FLOATING_BUTTON_SIZE = 56;
export const FLOATING_BUTTON_GAP = 12;
export const FLOATING_INSET = FLOATING_BUTTON_SIZE + FLOATING_BUTTON_GAP * 2;

export const FloatingInsetContext = createContext(0);

export function useFloatingInset(): number {
  return useContext(FloatingInsetContext);
}
