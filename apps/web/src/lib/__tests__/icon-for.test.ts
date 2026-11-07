import { describe, expect, it } from "vitest";
import {
  CRISIS_ICON_CHOICES,
  CRISIS_ICON_EXTRA,
  CRISIS_ICON_FALLBACK,
  crisisIconNameFor,
  normalizeEmoji,
} from "@focusflow/mo/crisis-icons";
import { CRISIS_ICON_NODES } from "@focusflow/mo/crisis-icon-nodes";
import { PICTO_NAMES } from "@focusflow/mo";
import {
  CRISIS_ICON_SPECS,
  ITEM_ICON_SPECS,
  MO_SPEC_FALLBACK,
  moSpecForCrisis,
  moSpecForItem,
} from "@focusflow/mo/step-icons";
import { CRISIS_ICON_KEYS } from "@/components/icon-picker-data";
import { ITEM_ICON_KEYS, itemIconKeyFor, storedValueForIcon } from "../item-icons";

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

describe("Mō drawings for stored icons", () => {
  const drawable = (spec: { kind: string; name: string }) =>
    spec.kind !== "picto" || (PICTO_NAMES as readonly string[]).includes(spec.name);

  it("gives every picker key a Mō drawing", () => {
    for (const key of ITEM_ICON_KEYS) {
      expect(itemIconKeyFor(storedValueForIcon(key)), key).toBe(key);
      expect(drawable(ITEM_ICON_SPECS[key]), key).toBe(true);
      expect(moSpecForItem({ label: "", emoji: storedValueForIcon(key), kind: "step" }), key).toBeDefined();
    }
  });

  it("gives every crisis icon a Mō drawing", () => {
    for (const name of Object.keys(CRISIS_ICON_SPECS) as Array<keyof typeof CRISIS_ICON_SPECS>) {
      expect(drawable(CRISIS_ICON_SPECS[name]), name).toBe(true);
    }
    expect(moSpecForCrisis(null)).toEqual(CRISIS_ICON_SPECS[CRISIS_ICON_FALLBACK]);
    expect(moSpecForCrisis("\u{1F3B5}")).toEqual(ITEM_ICON_SPECS.music);
  });

  it("draws the bed and the cake of the reward board", () => {
    expect(moSpecForItem({ label: "Je fais mon lit", emoji: storedValueForIcon("bed"), kind: "behavior" })).toEqual({ kind: "picto", name: "lit" });
    expect(moSpecForItem({ label: "Faire un gâteau ensemble", emoji: storedValueForIcon("cake"), kind: "reward" })).toEqual({ kind: "picto", name: "gateau" });
  });

  it("falls back on a Mō drawing for unknown or empty values", () => {
    expect(moSpecForItem({ label: "", emoji: null, kind: "step" })).toEqual(MO_SPEC_FALLBACK);
    expect(moSpecForItem({ label: "", emoji: "\u{1F984}", kind: "step" })).toEqual(CRISIS_ICON_SPECS[CRISIS_ICON_FALLBACK]);
  });

  it("keeps the crisis picker values on the drawing the crisis list shows", () => {
    for (const key of CRISIS_ICON_KEYS) {
      expect(moSpecForCrisis(storedValueForIcon(key)), key).toEqual(ITEM_ICON_SPECS[key]);
    }
  });
});

describe("icon picker grid", () => {
  it("never shows the same drawing twice", async () => {
    const { distinctDrawings } = await import("@/components/icon-picker");
    for (const keys of [ITEM_ICON_KEYS, CRISIS_ICON_KEYS]) {
      const ids = distinctDrawings(keys).map((k) => `${ITEM_ICON_SPECS[k].kind}:${ITEM_ICON_SPECS[k].name}`);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThan(15);
    }
  });
});
