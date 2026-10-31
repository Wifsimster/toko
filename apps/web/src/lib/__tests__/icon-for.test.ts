import { describe, expect, it } from "vitest";
import {
  CRISIS_ICON_CHOICES,
  CRISIS_ICON_EXTRA,
  CRISIS_ICON_FALLBACK,
  crisisIconNameFor,
  normalizeEmoji,
} from "@focusflow/mo/crisis-icons";
import { CRISIS_ICON_NODES } from "@focusflow/mo/crisis-icon-nodes";
import { CRISIS_ICON_KEYS } from "@/components/icon-picker-data";
import { CRISIS_ICONS, iconFor, itemIconFor } from "../icon-for";
import {
  ITEM_ICON_COMPONENTS,
  ITEM_ICON_KEYS,
  itemIconKeyFor,
  storedValueForIcon,
} from "../item-icons";

describe("crisisIconNameFor", () => {
  it("maps each picker emoji to its icon", () => {
    for (const c of CRISIS_ICON_CHOICES) expect(crisisIconNameFor(c.emoji)).toBe(c.icon);
  });

  it("maps the extra emojis, with or without variation selector", () => {
    for (const [icon, list] of CRISIS_ICON_EXTRA) {
      for (const emoji of list) {
        const expected = CRISIS_ICON_CHOICES.find((c) => normalizeEmoji(c.emoji) === normalizeEmoji(emoji))?.icon ?? icon;
        expect(crisisIconNameFor(emoji)).toBe(expected);
        expect(crisisIconNameFor(normalizeEmoji(emoji))).toBe(expected);
      }
    }
  });

  it("falls back for unknown, empty and missing emojis", () => {
    for (const e of ["\u{1F984}", "", "  ", null, undefined]) expect(crisisIconNameFor(e)).toBe(CRISIS_ICON_FALLBACK);
  });

  it("keeps the emoji of the default suggestions on the heart-family icons", () => {
    expect(crisisIconNameFor("\u{1F9D8}")).toBe("Wind");
    expect(crisisIconNameFor("\u{1FAE7}")).toBe("Sparkles");
  });
});

describe("web iconFor", () => {
  it("has a lucide component for every name the shared table can return", () => {
    const names = new Set([
      CRISIS_ICON_FALLBACK,
      ...CRISIS_ICON_CHOICES.map((c) => c.icon),
      ...CRISIS_ICON_EXTRA.map(([icon]) => icon),
    ]);
    for (const name of names) expect(CRISIS_ICONS[name], name).toBeDefined();
  });

  it("returns the mapped icon and the default one for unknown emojis", () => {
    expect(iconFor({ emoji: "\u{1F3B5}" })).toBe(CRISIS_ICONS.Music);
    expect(iconFor({ emoji: "\u{1F984}" })).toBe(CRISIS_ICONS.Heart);
    expect(iconFor({ emoji: null })).toBe(CRISIS_ICONS.Heart);
  });

  it("shows the plush toy emoji as a rabbit", () => {
    expect(crisisIconNameFor("\u{1F9F8}")).toBe("Rabbit");
    expect(iconFor({ emoji: "\u{1F9F8}" })).toBe(CRISIS_ICONS.Rabbit);
  });
});

describe("shared icon nodes used by the PDF", () => {
  it("match the lucide-react glyphs for every crisis icon", async () => {
    const kebab = (n: string) => n.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
    for (const name of Object.keys(CRISIS_ICON_NODES) as Array<keyof typeof CRISIS_ICON_NODES>) {
      const mod = (await import(`../../../node_modules/lucide-react/dist/esm/icons/${kebab(name)}.js`)) as {
        __iconNode: Array<[string, Record<string, string>]>;
      };
      const expected = mod.__iconNode.map(([tag, attrs]) => {
        const { key: _key, ...rest } = attrs;
        return [tag, rest];
      });
      expect(CRISIS_ICON_NODES[name], name).toEqual(expected);
    }
  });
});

describe("itemIconFor", () => {
  it("resolves icon keys, canonical values and legacy emojis to the same lucide icon", () => {
    const moon = ITEM_ICON_COMPONENTS.moon;
    expect(itemIconFor("moon")).toBe(moon);
    expect(itemIconFor(storedValueForIcon("moon"))).toBe(moon);
    expect(itemIconFor("\u{1F4A4}")).toBe(moon);
    expect(itemIconFor("\u{1F634}")).toBe(moon);
  });

  it("ignores the variation selector", () => {
    expect(itemIconFor("\u{270F}\u{FE0F}")).toBe(itemIconFor("\u{270F}"));
    expect(itemIconFor("\u{270F}\u{FE0F}")).toBe(ITEM_ICON_COMPONENTS.pencil);
  });

  it("falls back to the neutral heart for unknown or empty values", () => {
    for (const v of ["\u{1F984}", "", "  ", null, undefined, "not-an-icon"]) {
      expect(itemIconFor(v)).toBe(CRISIS_ICONS.Heart);
    }
  });

  it("stores a canonical value that maps back to its own key", () => {
    for (const key of ITEM_ICON_KEYS) {
      expect(itemIconKeyFor(storedValueForIcon(key)), key).toBe(key);
      expect(ITEM_ICON_COMPONENTS[key], key).toBeDefined();
    }
  });

  it("keeps the crisis picker values on the icon the crisis table draws", () => {
    for (const key of CRISIS_ICON_KEYS) {
      const crisisName = crisisIconNameFor(storedValueForIcon(key));
      expect(CRISIS_ICONS[crisisName], key).toBe(ITEM_ICON_COMPONENTS[key]);
    }
  });
});
