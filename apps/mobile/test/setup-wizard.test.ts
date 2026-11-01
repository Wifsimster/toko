import { describe, expect, it } from "vitest";
import { SETUP_THEME_IDS, setupThemeTabs } from "@focusflow/validators";
import { themeMoArt } from "../../../packages/mo/src/themes";
import { parentMoArt } from "../../../packages/mo/src/parent";
import { menuBar, setupWizard } from "../src/lib/copy";
import {
  SETUP_THEME_MO,
  SETUP_UNSURE_MO,
  SETUP_WIZARD_STEPS,
  setupBack,
} from "../src/lib/setup-wizard";
import { TAB_DEFS } from "../src/navigation/nav-model";

describe("assistant de la barre", () => {
  it("tient en deux étapes", () => {
    expect(SETUP_WIZARD_STEPS).toBe(2);
    expect(setupWizard.step(1, SETUP_WIZARD_STEPS)).toBe("Étape 1 sur 2");
    expect(setupWizard.step(2, SETUP_WIZARD_STEPS)).toBe("Étape 2 sur 2");
  });

  it("donne à chaque thème son propre Mō, dessiné et en état parent", () => {
    const poses = SETUP_THEME_IDS.map((id) => SETUP_THEME_MO[id]);
    expect(new Set([...poses, SETUP_UNSURE_MO]).size).toBe(SETUP_THEME_IDS.length + 1);
    for (const pose of poses) expect(themeMoArt[pose]?.small.paths.length, pose).toBeGreaterThan(0);
    expect(parentMoArt[SETUP_UNSURE_MO].small.paths.length).toBeGreaterThan(0);
  });

  it("valide sur le thème choisi, garde la barre sinon", () => {
    expect(setupWizard.next).toBe("Valider");
    expect(setupWizard.keep).toBe("Garder la barre actuelle");
  });

  it("retour matériel : passe à l'étape 1, ferme sur C'est prêt, attend pendant l'enregistrement", () => {
    expect(setupBack(0, false)).toBe("skip");
    expect(setupBack(1, false)).toBe("close");
    expect(setupBack(0, true)).toBe("wait");
    expect(setupBack(1, true)).toBe("wait");
  });

  it("annonce sur la carte les libellés de la barre", () => {
    expect(setupThemeTabs("medical").map((id) => TAB_DEFS[id].short)).toEqual(["Symptômes", "Traitements", "Rapport"]);
    expect(setupThemeTabs("barkley").map((id) => TAB_DEFS[id].short)).toEqual(["Barkley", "Étoiles", "Suivi"]);
  });

  it("n'a plus de texte pour l'ancienne étape d'édition", () => {
    for (const key of ["barTitle", "barBody", "barPlus", "barAvailable", "confirm", "back"]) {
      expect(setupWizard, key).not.toHaveProperty(key);
    }
  });

  it("a un titre et un texte pour chaque thème", () => {
    for (const id of SETUP_THEME_IDS) {
      expect(setupWizard.themes[id].title.length, id).toBeGreaterThan(0);
      expect(setupWizard.themes[id].body.length, id).toBeGreaterThan(0);
    }
  });

  it("ne répète pas la note sur la carte Je ne sais pas encore", () => {
    expect(setupWizard.unsureBody).not.toContain("barre actuelle");
    expect(setupWizard.keepNote).toContain("barre actuelle");
  });

  it("parle des deux étapes, sans étape suivante pour la barre", () => {
    for (const value of Object.values(setupWizard)) {
      if (typeof value === "string") expect(value).not.toMatch(/étape suivante/i);
    }
  });

  it("nomme chaque onglet de la barre avec sa position", () => {
    expect(menuBar.tabLabel("Traitements", 2, 5)).toBe("Traitements, 2 sur 5");
  });
});
