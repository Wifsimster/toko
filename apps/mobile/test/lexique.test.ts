import { describe, expect, it } from "vitest";
import fr from "../../web/src/lib/i18n/locales/fr.json";
import {
  LEXIQUE_CATEGORIES,
  filterLexique,
  groupLexiqueByCategory,
  lexiqueTerms,
  normalizeLexiqueText,
} from "@focusflow/validators";
import { lexicon } from "../src/lib/copy";
import { knowledgeArticles } from "../src/lib/knowledge";

describe("lexique partagé", () => {
  it("lit la même source que le web", () => {
    expect(lexiqueTerms.length).toBeGreaterThan(30);
    expect(new Set(lexiqueTerms.map((t) => t.term.toLowerCase())).size).toBe(lexiqueTerms.length);
  });

  it("n'utilise que des catégories déclarées et les remplit toutes", () => {
    const ids = new Set(LEXIQUE_CATEGORIES.map((c) => c.id));
    for (const term of lexiqueTerms) expect(ids.has(term.category)).toBe(true);
    for (const cat of LEXIQUE_CATEGORIES) expect(lexiqueTerms.some((t) => t.category === cat.id)).toBe(true);
  });

  it("garde des filtres assez courts pour un téléphone", () => {
    for (const cat of LEXIQUE_CATEGORIES) expect(cat.shortLabel.length).toBeLessThanOrEqual(20);
  });

  it("ne renvoie vers un article que si l'app mobile l'embarque", () => {
    const slugs = new Set(knowledgeArticles.map((a) => a.slug));
    const related = lexiqueTerms.flatMap((t) => (t.relatedSlug ? [t.relatedSlug] : []));
    expect(related.length).toBeGreaterThan(0);
    for (const slug of related) expect(slugs.has(slug), slug).toBe(true);
  });
});

describe("recherche du lexique", () => {
  it("ignore la casse, les accents et la ponctuation", () => {
    expect(normalizeLexiqueText("  Déficit d'Attention ! ")).toBe("deficit d attention");
  });

  it("retrouve un sigle, une étiquette, un alias ou un mot de la définition", () => {
    expect(filterLexique("mdph", "all").map((t) => t.term)).toContain("MDPH");
    expect(filterLexique("dyslexie", "all").map((t) => t.term)).toContain("DYS");
    expect(filterLexique("neurodeveloppemental", "all").map((t) => t.term)).toContain("TND");
  });

  it("combine recherche et catégorie", () => {
    const all = filterLexique("", "all");
    expect(all).toHaveLength(lexiqueTerms.length);
    const school = filterLexique("", "ecole");
    expect(school.length).toBeGreaterThan(0);
    expect(school.every((t) => t.category === "ecole")).toBe(true);
    expect(filterLexique("mdph", "ecole").some((t) => t.term === "MDPH")).toBe(false);
  });

  it("renvoie une liste vide pour un mot inconnu", () => {
    expect(filterLexique("zzzqqq", "all")).toEqual([]);
  });

  it("regroupe par catégorie dans l'ordre du web et sans section vide", () => {
    const sections = groupLexiqueByCategory(filterLexique("", "all"));
    expect(sections.map((s) => s.id)).toEqual(LEXIQUE_CATEGORIES.map((c) => c.id));
    expect(groupLexiqueByCategory(filterLexique("mdph", "all")).every((s) => s.entries.length > 0)).toBe(true);
  });
});

describe("textes du lexique alignés sur le web", () => {
  it("reprend titre, sous-titre et mention de fr.json", () => {
    expect(lexicon.title).toBe(fr.lexicon.title);
    expect(lexicon.subtitle).toBe(fr.lexicon.subtitle);
    expect(lexicon.disclaimer).toBe(fr.lexicon.disclaimer);
  });
});
