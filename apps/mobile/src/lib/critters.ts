import type { CompanionId } from "@focusflow/mo/child";

export type Critter = {
  id: CompanionId;
  name: string;
};

export const CRITTER_CATALOG: readonly Critter[] = [
  { id: "chick", name: "Le poussin" },
  { id: "butterfly", name: "Le papillon" },
  { id: "fox", name: "Le renard" },
  { id: "rabbit", name: "Le lapin" },
  { id: "turtle", name: "La tortue" },
  { id: "dog", name: "Le chien" },
  { id: "cat", name: "Le chat" },
  { id: "penguin", name: "Le manchot" },
  { id: "panda", name: "Le panda" },
  { id: "hedgehog", name: "Le hérisson" },
  { id: "owl", name: "Le hibou" },
  { id: "bear", name: "L'ours" },
  { id: "lion", name: "Le lion" },
  { id: "frog", name: "La grenouille" },
  { id: "koala", name: "Le koala" },
  { id: "unicorn", name: "La licorne" },
  { id: "monkey", name: "Le singe" },
  { id: "pig", name: "Le cochon" },
  { id: "ladybug", name: "La coccinelle" },
  { id: "whale", name: "La baleine" },
] as const;

export function pickCritter(): Critter {
  return CRITTER_CATALOG[Math.floor(Math.random() * CRITTER_CATALOG.length)]!;
}

export function critterById(id: string): Critter | undefined {
  return CRITTER_CATALOG.find((cr) => cr.id === id);
}
