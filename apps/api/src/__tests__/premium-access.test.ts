import { describe, it, expect } from "vitest";
import { decidePremiumAccess } from "../lib/premium";

// Famille entitlement, shared by `requirePlan` and `GET /api/billing/status`.
// The two used to compute it independently, and `/billing/status` read
// `subscription.status` on its own — which Stripe leaves at "active" during a
// pause_collection window. The frontend then unlocked every PremiumGate while
// the API answered 403 PLAN_PAUSED on the calls behind them.
describe("decidePremiumAccess", () => {
  const now = new Date("2026-06-01T12:00:00Z");
  const future = new Date("2026-08-01T00:00:00Z");
  const past = new Date("2026-05-01T00:00:00Z");
  const base = { granted: false, status: null as string | null, pausedUntil: null as Date | null, now };

  it("grants access to an active subscriber", () => {
    expect(decidePremiumAccess({ ...base, status: "active" })).toMatchObject({
      active: true,
      paused: false,
    });
  });

  it("grants access during the trial", () => {
    expect(decidePremiumAccess({ ...base, status: "trialing" })).toMatchObject({
      active: true,
      paused: false,
    });
  });

  it("does NOT grant access while the subscription is paused", () => {
    // Stripe keeps status === "active" for the whole pause window.
    expect(
      decidePremiumAccess({ ...base, status: "active", pausedUntil: future }),
    ).toMatchObject({ active: false, paused: true, pausedUntil: future });
  });

  it("treats an elapsed pause window as no longer paused", () => {
    expect(
      decidePremiumAccess({ ...base, status: "active", pausedUntil: past }),
    ).toMatchObject({ active: true, paused: false, pausedUntil: null });
  });

  it("lets an admin grant override a paused subscription", () => {
    expect(
      decidePremiumAccess({
        ...base,
        granted: true,
        status: "active",
        pausedUntil: future,
      }),
    ).toMatchObject({ active: true, paused: false, pausedUntil: null });
  });

  it("grants access on an admin grant with no subscription row", () => {
    expect(decidePremiumAccess({ ...base, granted: true })).toMatchObject({
      active: true,
      subscriptionStatus: "none",
      granted: true,
    });
  });

  it("denies access on a canceled or past_due subscription", () => {
    expect(decidePremiumAccess({ ...base, status: "canceled" }).active).toBe(
      false,
    );
    expect(decidePremiumAccess({ ...base, status: "past_due" }).active).toBe(
      false,
    );
  });

  it("denies access with no subscription at all", () => {
    expect(decidePremiumAccess(base)).toMatchObject({
      active: false,
      paused: false,
      subscriptionStatus: "none",
    });
  });
});
