import { describe, expect, it } from "vitest";
import * as lucide from "lucide-react";
import { MORE_ENTRIES, MORE_GROUPS, MORE_NAV, PRIMARY_NAV, type MoreEntryId } from "@focusflow/validators";
import fr from "@/lib/i18n/locales/fr.json";
import { isMoreActive, moreItems, moreNavItem, primaryNavItems } from "../nav";

const byName = lucide as unknown as Record<string, unknown>;
const shared = (name: string) => byName[name];

const text = (key: string): unknown =>
  key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], fr);

const ids = Object.keys(MORE_ENTRIES) as MoreEntryId[];

describe("navigation partagée web / mobile", () => {
  it("la barre principale web suit la définition partagée", () => {
    expect(
      primaryNavItems.map((i) => [i.to, i.labelKey, i.shortLabelKey, i.icon]),
    ).toEqual(PRIMARY_NAV.map((i) => [i.to, i.labelKey, i.shortLabelKey, shared(i.icon)]));
    expect([moreNavItem.to, moreNavItem.labelKey, moreNavItem.icon]).toEqual([
      MORE_NAV.to,
      MORE_NAV.labelKey,
      shared(MORE_NAV.icon),
    ]);
  });

  it("Suivi ouvre le journal", () => {
    expect(PRIMARY_NAV.find((i) => i.labelKey === "nav.tracking")?.to).toBe("/journal");
  });

  it("Plus web suit le catalogue partagé", () => {
    expect(Object.keys(moreItems).sort()).toEqual([...ids].sort());
    for (const id of ids) {
      const item = moreItems[id];
      const entry = MORE_ENTRIES[id];
      expect([item.id, item.to, item.labelKey, item.descriptionKey, item.icon], id).toEqual([
        entry.id,
        entry.to,
        entry.labelKey,
        entry.descriptionKey,
        shared(entry.icon),
      ]);
    }
  });

  it("Plus liste chaque page une seule fois, en groupes nommés", () => {
    const listed = MORE_GROUPS.flatMap((g) => g.ids);
    expect([...listed].sort()).toEqual([...ids].sort());
    expect(MORE_GROUPS.map((g) => text(g.labelKey))).toEqual([
      "Au quotidien",
      "Outils",
      "Comprendre",
      "En cas de besoin",
      "Compte",
    ]);
  });

  it("chaque entrée de Plus a un libellé et une description courte", () => {
    for (const id of ids) {
      const entry = MORE_ENTRIES[id];
      expect(text(entry.labelKey), id).toEqual(expect.any(String));
      const description = text(entry.descriptionKey);
      expect(description, id).toEqual(expect.any(String));
      expect((description as string).length, id).toBeLessThanOrEqual(50);
    }
  });
});

describe("onglet Plus actif", () => {
  it("s'allume sur /plus et sur les pages rangées dans Plus", () => {
    expect(isMoreActive("/plus")).toBe(true);
    expect(isMoreActive("/symptoms")).toBe(true);
    expect(isMoreActive("/connaissances/un-article")).toBe(true);
    expect(isMoreActive("/report")).toBe(true);
    expect(isMoreActive("/account")).toBe(true);
  });

  it("reste éteint sur les onglets de la barre", () => {
    for (const path of ["/dashboard", "/journal", "/barkley", "/barkley/step/1"]) {
      expect(isMoreActive(path), path).toBe(false);
    }
  });
});
