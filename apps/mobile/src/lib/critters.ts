// The pool of friendly critters the timer companion can hatch into, ported
// from the PWA (apps/web/src/components/timer/critters.ts + i18n critters.*).
// Each has a stable `id` (persisted via /companions) and a French name shown
// in the reveal and the collection. Kept short and universally recognizable
// so a young child reads the reward instantly.
export type Critter = {
  id: string;
  emoji: string;
  name: string;
};

export const CRITTER_CATALOG: readonly Critter[] = [
  { id: "chick", emoji: "🐥", name: "Le poussin" },
  { id: "butterfly", emoji: "🦋", name: "Le papillon" },
  { id: "fox", emoji: "🦊", name: "Le renard" },
  { id: "rabbit", emoji: "🐰", name: "Le lapin" },
  { id: "turtle", emoji: "🐢", name: "La tortue" },
  { id: "dog", emoji: "🐶", name: "Le chien" },
  { id: "cat", emoji: "🐱", name: "Le chat" },
  { id: "penguin", emoji: "🐧", name: "Le manchot" },
  { id: "panda", emoji: "🐼", name: "Le panda" },
  { id: "hedgehog", emoji: "🦔", name: "Le hérisson" },
  { id: "owl", emoji: "🦉", name: "Le hibou" },
  { id: "bear", emoji: "🐻", name: "L'ours" },
  { id: "lion", emoji: "🦁", name: "Le lion" },
  { id: "frog", emoji: "🐸", name: "La grenouille" },
  { id: "koala", emoji: "🐨", name: "Le koala" },
  { id: "unicorn", emoji: "🦄", name: "La licorne" },
  { id: "monkey", emoji: "🐵", name: "Le singe" },
  { id: "pig", emoji: "🐷", name: "Le cochon" },
  { id: "ladybug", emoji: "🐞", name: "La coccinelle" },
  { id: "whale", emoji: "🐳", name: "La baleine" },
] as const;

/** Random critter for a fresh discovery. */
export function pickCritter(): Critter {
  return CRITTER_CATALOG[Math.floor(Math.random() * CRITTER_CATALOG.length)]!;
}

export function critterById(id: string): Critter | undefined {
  return CRITTER_CATALOG.find((cr) => cr.id === id);
}
