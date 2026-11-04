const WORDS_PER_MINUTE = 200;

function collectText(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectText(v, out);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectText(v, out);
  }
}

export function readingMinutes(content: unknown): number {
  const parts: string[] = [];
  collectText(content, parts);
  const words = parts.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
