import { describe, expect, it } from "vitest";
import { PICTO_NAMES } from "../../../packages/mo/src/generated/ids";
import { ROUTINE_TEMPLATES } from "../../../packages/validators/src/routine-templates";
import { ITEM_ICON_KEYS, ITEM_ICON_STORED } from "../../../packages/mo/src/item-icons";
import { ICON_CHOICES, PICKER_CHOICES, iconFor, iconForEmoji, pictoForStep, type IconSpec } from "../src/lib/icon-for";

const key = (spec: IconSpec | undefined) => (!spec ? "rien" : spec.kind === "lucide" ? "lucide" : `${spec.kind}:${spec.name}`);
const step = (label: string, emoji?: string) => key(iconFor({ label, emoji, kind: "step" }));
const routine = (label: string, emoji?: string) => key(iconFor({ label, emoji, kind: "routine" }));

describe("iconFor : un dessin Mō par étape de routine", () => {
  for (const t of ROUTINE_TEMPLATES) {
    it(`« ${t.title} » : chaque étape a un picto, tous différents`, () => {
      const pictos = t.steps.map((s) => iconFor({ label: s.label, emoji: s.emoji, kind: "step" }));
      for (const [i, spec] of pictos.entries()) expect(spec?.kind, t.steps[i].label).toBe("picto");
      expect(new Set(pictos.map(key)).size).toBe(pictos.length);
    });
  }

  it("chaque étape d'un modèle a aussi un picto par son seul emoji", () => {
    for (const t of ROUTINE_TEMPLATES) {
      for (const s of t.steps) expect(iconForEmoji(s.emoji)?.kind, s.label).toBe("picto");
    }
  });

  it("donne le dessin attendu aux étapes des modèles", () => {
    const expected: Record<string, string> = {
      "Se lever et boire un verre d'eau": "verre",
      "Aller aux toilettes et se laver le visage": "lavabo",
      "S'habiller (vêtements préparés la veille)": "habits",
      "Petit-déjeuner": "bol",
      "Brosser les dents": "dents",
      "Cartable et chaussures": "cartable",
      "Poser le cartable au même endroit": "cartable",
      "Goûter": "gouter",
      "20 min de défoulement (bouger, jouer dehors)": "ballon",
      "Vider le cahier de liaison avec le parent": "cahier",
      "Sortir le matériel et lire la consigne à voix haute": "livre",
      "Travail concentré (minuteur visible)": "sablier",
      "Pause active": "ballon",
      Relecture: "loupe",
      "Ranger le matériel": "rangement",
      "Fin des écrans": "ecran",
      "Douche ou bain tiède": "douche",
      "Pyjama et brossage des dents": "dents",
      "Préparer les affaires du lendemain": "cartable",
      "Lecture calme ou histoire": "livre",
      "Câlin et lumière éteinte": "calin",
      "Annonce 5 min avant la fin": "bulle",
      "Ranger l'activité en cours": "rangement",
      "Démarrer la suivante avec un signal": "cloche",
      "Médicament (si prescrit)": "medicament",
      "Manger quelque chose": "repas",
      Dormir: "oreiller",
    };
    const steps = ROUTINE_TEMPLATES.flatMap((t) => t.steps);
    expect(Object.keys(expected).sort()).toEqual([...new Set(steps.map((s) => s.label))].sort());
    for (const s of steps) expect(step(s.label, s.emoji), s.label).toBe(`picto:${expected[s.label]}`);
  });

  it("reconnaît les étapes écrites à la main, sans emoji", () => {
    expect(step("Repas")).toBe("picto:repas");
    expect(step("Sirop pour le fer")).toBe("picto:medicament");
    expect(step("Câlin")).toBe("picto:calin");
    expect(step("Lumière éteinte")).toBe("picto:lampe");
    expect(step("Mettre ses chaussures")).toBe("picto:chaussures");
    expect(step("Se laver les mains")).toBe("picto:lavabo");
    expect(step("Éteindre la télé")).toBe("picto:ecran");
    expect(step("Faire ses devoirs")).toBe("picto:livre");
    expect(step("Écrire les mots du jour")).toBe("picto:crayon");
    expect(step("Préparer la tablette")).toBe("picto:ecran");
    expect(step("Mettre la table")).toBe("rien");
  });

  it("garde les pictogrammes de paysage des routines", () => {
    expect(routine("Coucher sans cris", "\u{1F319}")).toBe("mo-icon:couchers");
    expect(routine("Dodo")).toBe("mo-icon:couchers");
    expect(routine("Dormir")).toBe("mo-icon:couchers");
    expect(routine("Matin d'école", "\u{1F31E}")).toBe("mo-icon:matins");
    expect(routine("Devoirs", "✏️")).toBe("picto:livre");
    expect(step("Lumière éteinte", "\u{1F319}")).toBe("picto:lampe");
  });

  it("ne détourne pas les comportements et récompenses par défaut", () => {
    const behavior = (label: string, emoji: string) => key(iconFor({ label, emoji, kind: "behavior" }));
    const reward = (label: string, emoji: string) => key(iconFor({ label, emoji, kind: "reward" }));
    expect(behavior("Je me brosse les dents", "\u{1FAA5}")).toBe("picto:dents");
    expect(behavior("Je range mes affaires", "\u{1F392}")).toBe("picto:rangement");
    expect(reward("Choisir l'histoire du soir", "\u{1F4D6}")).toBe("picto:livre");
    expect(reward("Temps d'écran bonus", "\u{1F3AE}")).toBe("lucide");
  });

  it("pictoForStep pose un picto au centre du cadran, le pyjama pour la lune", () => {
    expect(pictoForStep("Travail concentré (minuteur visible)", "⏱️")).toBe("sablier");
    expect(pictoForStep("Au lit", "\u{1F319}")).toBe("pyjama");
    expect(pictoForStep("Se préparer", "\u{1F31E}")).toBeUndefined();
  });
});

describe("ICON_CHOICES", () => {
  it("chaque choix a un emoji unique qui redonne son dessin", () => {
    expect(new Set(ICON_CHOICES.map((c) => c.emoji)).size).toBe(ICON_CHOICES.length);
    for (const c of ICON_CHOICES) expect(key(iconForEmoji(c.emoji)), c.label).toBe(key(c.spec));
  });

  it("propose chaque picto d'étape, et aucun œuf du minuteur", () => {
    const offered = new Set(ICON_CHOICES.flatMap((c) => (c.spec.kind === "picto" ? [c.spec.name] : [])));
    const stepPictos = PICTO_NAMES.filter((n) => !n.startsWith("oeuf"));
    expect([...offered].sort()).toEqual([...stepPictos].sort());
  });

  it("des libellés courts, qui tiennent dans une case de la grille", () => {
    for (const c of ICON_CHOICES) expect(c.label.length, c.label).toBeLessThanOrEqual(11);
  });
});

describe("icônes partagées avec le site", () => {
  const kind = (emoji: string) => iconFor({ label: "", emoji, kind: "reward" })?.kind;

  it("les 84 icônes du site ont un dessin sur mobile", () => {
    for (const k of ITEM_ICON_KEYS) expect(iconFor({ label: "", emoji: ITEM_ICON_STORED[k], kind: "reward" }), k).toBeDefined();
  });

  it("garde les pictos Mō en premier et complète avec lucide", () => {
    expect(kind("\u{1F6BD}")).toBe("picto");
    expect(kind("\u{1F50D}")).toBe("picto");
    expect(kind("\u{1F499}")).toBe("lucide");
    expect(kind("\u{1F415}")).toBe("lucide");
    expect(kind("inconnu")).toBeUndefined();
  });

  it("le sélecteur propose chaque icône du site et garde les choix Mō", () => {
    const emojis = PICKER_CHOICES.map((c) => c.emoji);
    expect(new Set(emojis).size).toBe(emojis.length);
    expect(emojis.slice(0, ICON_CHOICES.length)).toEqual(ICON_CHOICES.map((c) => c.emoji));
    const id = (spec: IconSpec) => (spec.kind === "lucide" ? String(spec.icon.displayName) : `${spec.kind}:${spec.name}`);
    for (const c of PICKER_CHOICES) {
      expect(id(c.spec), c.label).toBe(id(iconFor({ label: "", emoji: c.emoji, kind: "step" })!));
    }
    const ids = PICKER_CHOICES.map((c) => id(c.spec));
    expect(new Set(ids).size).toBe(ids.length);
    const offered = new Set(ids);
    for (const k of ITEM_ICON_KEYS) {
      const spec = iconFor({ label: "", emoji: ITEM_ICON_STORED[k], kind: "step" })!;
      expect(offered.has(id(spec)), k).toBe(true);
    }
  });
});
