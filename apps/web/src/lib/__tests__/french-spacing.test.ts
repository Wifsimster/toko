import { describe, expect, it } from "vitest";
import { frenchSpacing } from "../french-spacing";

describe("frenchSpacing", () => {
  it("lie la ponctuation double au mot qui précède", () => {
    expect(frenchSpacing("Crise TDAH : le guide")).toBe("Crise TDAH : le guide");
    expect(frenchSpacing("Que faire ? Vite !")).toBe("Que faire ? Vite !");
  });

  it("lie les guillemets français à leur contenu", () => {
    expect(frenchSpacing("« Je suis là. »")).toBe("« Je suis là. »");
  });

  it("laisse intact un texte sans ponctuation double", () => {
    expect(frenchSpacing("Fonctions exécutives et TDAH")).toBe("Fonctions exécutives et TDAH");
  });
});
