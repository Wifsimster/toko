import type { Block } from "./knowledge";

export function sectionIndexes(body: readonly Block[]): (number | null)[] {
  let next = 0;
  return body.map((block) => (block.type === "h2" ? next++ : null));
}
