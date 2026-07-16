import { describe, it, expect } from "vitest";
import { decideFormationAccess } from "../lib/premium";

// The Formation entitlement precedence, per the "trois offres" decision:
// grandfathered > one-shot purchase > active Famille (sub or admin grant) > none.
// A Formation purchase is permanent; Famille bundles the content while active.
describe("decideFormationAccess", () => {
  const base = {
    grandfathered: false,
    purchasedAt: null as Date | null,
    premiumActive: false,
    premiumGranted: false,
  };

  it("grandfathers pre-launch accounts (highest precedence)", () => {
    expect(decideFormationAccess({ ...base, grandfathered: true })).toEqual({
      ownsFormation: true,
      reason: "grandfathered",
    });
  });

  it("grants access to a one-shot buyer", () => {
    expect(
      decideFormationAccess({ ...base, purchasedAt: new Date("2026-01-01") }),
    ).toEqual({ ownsFormation: true, reason: "purchase" });
  });

  it("bundles the formation for an active Famille subscriber", () => {
    expect(decideFormationAccess({ ...base, premiumActive: true })).toEqual({
      ownsFormation: true,
      reason: "famille",
    });
  });

  it("labels an admin-granted premium user as 'granted'", () => {
    expect(
      decideFormationAccess({
        ...base,
        premiumActive: true,
        premiumGranted: true,
      }),
    ).toEqual({ ownsFormation: true, reason: "granted" });
  });

  it("locks a new free account (must buy the formation)", () => {
    expect(decideFormationAccess(base)).toEqual({
      ownsFormation: false,
      reason: "none",
    });
  });

  it("keeps a one-shot buyer's access even when their Famille sub lapses", () => {
    // purchase is permanent — premiumActive false must not revoke it
    expect(
      decideFormationAccess({
        ...base,
        purchasedAt: new Date("2026-01-01"),
        premiumActive: false,
      }),
    ).toEqual({ ownsFormation: true, reason: "purchase" });
  });

  it("prefers the grandfathered reason over a concurrent purchase", () => {
    expect(
      decideFormationAccess({
        ...base,
        grandfathered: true,
        purchasedAt: new Date("2026-01-01"),
      }),
    ).toEqual({ ownsFormation: true, reason: "grandfathered" });
  });
});
