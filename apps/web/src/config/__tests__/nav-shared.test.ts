import { describe, expect, it } from "vitest";
import * as lucide from "lucide-react";
import { HUB_GROUPS, HUB_ITEMS, PRIMARY_NAV } from "@focusflow/validators";
import { hubGroups, hubNavItems, primaryNavItems } from "../nav";

const byName = lucide as unknown as Record<string, unknown>;
const shared = (name: string) => byName[name];

describe("navigation partagée web / mobile", () => {
  it("la barre principale web suit la définition partagée", () => {
    expect(
      primaryNavItems.map((i) => [i.to, i.labelKey, i.shortLabelKey, i.icon]),
    ).toEqual(PRIMARY_NAV.map((i) => [i.to, i.labelKey, i.shortLabelKey, shared(i.icon)]));
  });

  it("le hub Suivi web suit la définition partagée", () => {
    expect(
      hubNavItems.map((i) => [i.to, i.labelKey, i.descriptionKey, i.hubGroup, i.icon]),
    ).toEqual(HUB_ITEMS.map((i) => [i.to, i.labelKey, i.descriptionKey, i.hubGroup, shared(i.icon)]));
    expect(hubGroups).toEqual(HUB_GROUPS);
  });
});
