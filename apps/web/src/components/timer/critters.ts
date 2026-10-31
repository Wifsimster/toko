import type { CompanionId } from "@focusflow/mo";

export type Critter = {
  id: CompanionId;
};

export const CRITTER_CATALOG: readonly Critter[] = [
  { id: "chick" },
  { id: "butterfly" },
  { id: "fox" },
  { id: "rabbit" },
  { id: "turtle" },
  { id: "dog" },
  { id: "cat" },
  { id: "penguin" },
  { id: "panda" },
  { id: "hedgehog" },
] as const;

export { pickCritter, critterById } from "./critter-utils";
