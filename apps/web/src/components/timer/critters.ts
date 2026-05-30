// The pool of friendly critters the timer companion can hatch into. Kept
// short and universally recognizable so a young child reads the reward
// instantly. Each critter has a stable `id` used to persist discoveries;
// its name is an i18n key (`critters.<id>`) so both timer and collection
// stay in sync and translatable.
export type Critter = {
  id: string;
  emoji: string;
};

export const CRITTER_CATALOG: readonly Critter[] = [
  { id: "chick", emoji: "🐥" },
  { id: "butterfly", emoji: "🦋" },
  { id: "fox", emoji: "🦊" },
  { id: "rabbit", emoji: "🐰" },
  { id: "turtle", emoji: "🐢" },
  { id: "dog", emoji: "🐶" },
  { id: "cat", emoji: "🐱" },
  { id: "penguin", emoji: "🐧" },
  { id: "panda", emoji: "🐼" },
  { id: "hedgehog", emoji: "🦔" },
] as const;

export { pickCritter, critterById } from "./critter-utils";
