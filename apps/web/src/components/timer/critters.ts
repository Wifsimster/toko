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
