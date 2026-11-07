import { describe, expect, it } from "vitest";
import { loadMoArt } from "@focusflow/mo";
import { eyeIndexes } from "./interactive-mo";

describe("eyeIndexes", () => {
  it("trouve les deux yeux de Mō accueil, pupille et reflet", async () => {
    const art = await loadMoArt("accueil", "large");
    expect(eyeIndexes(art.paths)).toEqual([12, 13, 14, 15]);
  });
});
