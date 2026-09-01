import { describe, it, expect } from "vitest";
import fr from "../i18n/locales/fr.json";
import en from "../i18n/locales/en.json";

// `fallbackLng: "fr"` means a key missing from en.json doesn't blow up — it
// quietly renders the French string to an English-speaking parent. That is
// exactly how 84 keys (the whole `insights`, `solidarity` and `premiumGate`
// sections among them) drifted out of the English bundle unnoticed.
function flatten(
  value: unknown,
  prefix = "",
  out = new Map<string, unknown>(),
): Map<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  } else {
    out.set(prefix, value);
  }
  return out;
}

const frKeys = flatten(fr);
const enKeys = flatten(en);

describe("i18n locale parity", () => {
  it("has an English string for every French key", () => {
    const missing = [...frKeys.keys()].filter((k) => !enKeys.has(k));
    expect(missing).toEqual([]);
  });

  it("has a French string for every English key", () => {
    const missing = [...enKeys.keys()].filter((k) => !frKeys.has(k));
    expect(missing).toEqual([]);
  });

  it("keeps the same interpolation placeholders in both locales", () => {
    const placeholders = (v: unknown) =>
      typeof v === "string"
        ? [...v.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]!).sort()
        : [];
    const mismatched: string[] = [];
    for (const [key, frValue] of frKeys) {
      const enValue = enKeys.get(key);
      if (
        placeholders(frValue).join(",") !== placeholders(enValue).join(",")
      ) {
        mismatched.push(key);
      }
    }
    expect(mismatched).toEqual([]);
  });
});
