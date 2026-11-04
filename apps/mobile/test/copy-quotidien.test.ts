import { describe, expect, it } from "vitest";
import { barkley, behaviorTracking, rewards, routines } from "../src/lib/copy";

describe("textes Barkley, routines et récompenses", () => {
  it("matches the web strings", () => {
    expect(barkley.subtitle).toBe("Dix étapes, à votre rythme.");
    expect(barkley.readingTime(4)).toBe("≈ 4 min");
    expect(barkley.leafNote(1)).toBe("1 étape faite");
    expect(barkley.leafNote(3)).toBe("3 étapes faites");
    expect(barkley.leafDone(3)).toBe("Étape 3 : faite");
    expect(barkley.resume(4)).toBe("Reprendre l’étape 4");
    expect(routines.subtitle).toBe("La journée en petites étapes.");
    expect(routines.now.meta(4, 25)).toBe("4 étapes · 25 min");
    expect(routines.now.launchWithName("Léo")).toBe("Lancer avec Léo");
    expect(rewards.boardTitle("Léo")).toBe("Le tableau de Léo");
    expect(rewards.goalNext(3, "Film")).toBe("Encore 3 étoiles pour « Film »");
    expect(rewards.goalNext(1, "Film")).toBe("Encore 1 étoile pour « Film »");
    expect(rewards.goalReady("Film")).toBe("Assez d’étoiles pour « Film » !");
  });

  it("counts the week without a maximum", () => {
    expect(behaviorTracking.starsThisWeek(9)).toBe("9 étoiles cette semaine");
    expect(behaviorTracking.starsThisWeek(1)).toBe("1 étoile cette semaine");
    expect(behaviorTracking.starsThisWeek(9)).not.toContain("/");
  });
});
