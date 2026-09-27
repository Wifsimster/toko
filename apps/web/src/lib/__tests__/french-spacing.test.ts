import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { frenchSpacing, frenchSpacingNode } from "../french-spacing";

describe("frenchSpacing", () => {
  it("lie la ponctuation double au mot qui précède", () => {
    expect(frenchSpacing("Crise TDAH : le guide")).toBe("Crise TDAH : le guide");
    expect(frenchSpacing("Que faire ? Vite !")).toBe("Que faire ? Vite !");
  });

  it("lie les guillemets français à leur contenu", () => {
    expect(frenchSpacing("« Je suis là. »")).toBe("« Je suis là. »");
  });

  it("lie % et € au nombre qui précède", () => {
    expect(frenchSpacing("prévient 80 % des crises, 70 € par an")).toBe(
      "prévient 80\u00a0% des crises, 70\u00a0€ par an",
    );
  });

  it("laisse intact un texte sans ponctuation double", () => {
    expect(frenchSpacing("Fonctions exécutives et TDAH")).toBe("Fonctions exécutives et TDAH");
  });
});

describe("frenchSpacingNode", () => {
  it("traite les chaînes à toute profondeur des children", () => {
    const tree = createElement(
      "p",
      null,
      "Retenez ceci : ",
      createElement("strong", null, "« frein »"),
      " ?",
    );
    const out = frenchSpacingNode(tree);
    expect(renderToStaticMarkup(out as ReactElement)).toBe(
      "<p>Retenez ceci\u00a0: <strong>«\u00a0frein\u00a0»</strong>\u00a0?</p>",
    );
  });

  it("ne modifie ni les autres props ni le code", () => {
    const tree = createElement(
      "div",
      null,
      createElement("a", { href: "/a ?b", title: "x : y" }, "Voir : ici"),
      createElement("code", null, "a ? b : c"),
    );
    expect(renderToStaticMarkup(frenchSpacingNode(tree) as ReactElement)).toBe(
      '<div><a href="/a ?b" title="x : y">Voir\u00a0: ici</a><code>a ? b : c</code></div>',
    );
  });

  it("laisse passer ce qui n'est ni chaîne ni élément", () => {
    expect(frenchSpacingNode(null)).toBe(null);
    expect(frenchSpacingNode(42)).toBe(42);
    expect(frenchSpacingNode(false)).toBe(false);
  });
});
