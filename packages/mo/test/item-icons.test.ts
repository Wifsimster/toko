import { describe, expect, it } from "vitest";
import {
  ITEM_ICON_KEYS,
  ITEM_ICON_STORED,
  LEGACY_VALUES,
  itemIconKeyFor,
  normalizeIconValue,
  storedValueForIcon,
} from "../src/item-icons";

describe("item-icons", () => {
  it("chaque clé fait l'aller-retour via sa valeur stockée", () => {
    expect(ITEM_ICON_KEYS).toHaveLength(84);
    for (const key of ITEM_ICON_KEYS) {
      expect(itemIconKeyFor(storedValueForIcon(key)), key).toBe(key);
      expect(itemIconKeyFor(key), key).toBe(key);
    }
  });

  it("une valeur stockée est unique par clé", () => {
    expect(new Set(Object.values(ITEM_ICON_STORED)).size).toBe(ITEM_ICON_KEYS.length);
  });

  it("ignore le sélecteur de variation et les espaces", () => {
    expect(normalizeIconValue(" \u{270F}\u{FE0F} ")).toBe("\u{270F}");
    expect(itemIconKeyFor("\u{270F}\u{FE0F}")).toBe("pencil");
    expect(itemIconKeyFor(null)).toBeNull();
    expect(itemIconKeyFor("")).toBeNull();
  });

  it("comprend les valeurs historiques, dont les toilettes et la loupe", () => {
    expect(itemIconKeyFor("\u{1F6BD}")).toBe("bath");
    expect(itemIconKeyFor("\u{1F50D}")).toBe("target");
    expect(itemIconKeyFor("\u{1F50E}")).toBe("target");
    for (const key of Object.values(LEGACY_VALUES)) expect(ITEM_ICON_KEYS).toContain(key);
  });

  it("rend la valeur inconnue telle quelle", () => {
    expect(storedValueForIcon("inconnu")).toBe("inconnu");
    expect(itemIconKeyFor("inconnu")).toBeNull();
  });
});
