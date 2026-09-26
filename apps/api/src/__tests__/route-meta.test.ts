import { describe, it, expect } from "vitest";
import { applyRouteMeta } from "../lib/route-meta";

const SHELL = `<head>
<title>Tokō — App</title>
<meta name="description" content="Tokō desc" />
<meta property="og:url" content="https://toko.battistella.ovh/" />
<meta property="og:title" content="Tokō" />
<meta property="og:description" content="Tokō desc" />
<meta name="twitter:title" content="Tokō" />
<meta name="twitter:description" content="Tokō desc" />
</head>`;

describe("applyRouteMeta", () => {
  it("leaves unknown routes untouched", () => {
    expect(applyRouteMeta(SHELL, "/")).toBe(SHELL);
    expect(applyRouteMeta(SHELL, "/tarifs")).toBe(SHELL);
  });

  it("rewrites title, description and Open Graph tags for quiz pages", () => {
    const out = applyRouteMeta(SHELL, "/quiz/tdah-enfant/");
    expect(out).toContain("<title>TDAH de l'enfant");
    expect(out).toContain('og:url" content="https://toko.battistella.ovh/quiz/tdah-enfant"');
    expect(out).not.toContain('content="Tokō desc"');
    expect(out).not.toContain('content="Tokō"');
  });

  it("covers the TOP and the complete parcours", () => {
    for (const id of ["top-enfant", "complet-enfant", "complet-adulte"]) {
      expect(applyRouteMeta(SHELL, `/quiz/${id}`)).toContain(`/quiz/${id}"`);
    }
  });

  it("covers the quiz home", () => {
    expect(applyRouteMeta(SHELL, "/quiz")).toContain("Repères</title>");
  });
});
