import { CRITTER_CATALOG, type Critter } from "./critters";

export function pickCritter(): Critter {
  return CRITTER_CATALOG[
    Math.floor(Math.random() * CRITTER_CATALOG.length)
  ]!;
}

export function critterById(id: string): Critter | undefined {
  return CRITTER_CATALOG.find((c) => c.id === id);
}
