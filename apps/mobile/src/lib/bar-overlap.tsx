import { createContext, useContext } from "react";

import { SOS_DISC_SIZE } from "./sos";

export const SOS_BAR_OVERLAP = SOS_DISC_SIZE / 2;

export const BarOverlapContext = createContext(0);

export function useBarOverlap(): number {
  return useContext(BarOverlapContext);
}
