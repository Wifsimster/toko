import { lexiqueTerms } from "./lexique-data";
import type { LexiqueCategoryId, LexiqueTerm } from "./lexique-types";
import { LEXIQUE_CATEGORIES } from "./lexique-types";

export function normalizeLexiqueText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function filterLexique(
  query: string,
  category: LexiqueCategoryId | "all",
  terms: readonly LexiqueTerm[] = lexiqueTerms,
): LexiqueTerm[] {
  const needle = normalizeLexiqueText(query);
  return terms.filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (!needle) return true;
    const haystack = normalizeLexiqueText(
      [entry.term, entry.label ?? "", entry.definition, ...(entry.aliases ?? [])].join(" "),
    );
    return haystack.includes(needle);
  });
}

export function groupLexiqueByCategory(entries: readonly LexiqueTerm[]) {
  return LEXIQUE_CATEGORIES.map((cat) => ({
    ...cat,
    entries: entries.filter((entry) => entry.category === cat.id),
  })).filter((section) => section.entries.length > 0);
}
