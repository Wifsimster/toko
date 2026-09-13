import { describe, it, expect } from "vitest";
import { STRIPE_WEBHOOK_HANDLERS } from "../lib/billing/webhook-handlers";
import { containsDemoIdentifier } from "../lib/billing/webhook-ledger";
import type Stripe from "stripe";

// The registry replaced a switch. These assert the two properties the
// switch gave us for free and a map could silently lose: every event we
// claim to support is wired, and an unknown event is a no-op rather than a
// crash.

const SUPPORTED = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
];

function fakeEvent(overrides: Record<string, unknown> = {}): Stripe.Event {
  return {
    id: "evt_1",
    type: "checkout.session.completed",
    data: { object: {} },
    ...overrides,
  } as unknown as Stripe.Event;
}

describe("STRIPE_WEBHOOK_HANDLERS", () => {
  it("wires every supported event", () => {
    for (const type of SUPPORTED) {
      expect(STRIPE_WEBHOOK_HANDLERS[type]).toBeTypeOf("function");
    }
  });

  it("has no entry for an event we do not handle", () => {
    expect(STRIPE_WEBHOOK_HANDLERS["customer.created"]).toBeUndefined();
  });

  it("shares one handler across the subscription lifecycle events", () => {
    const handler = STRIPE_WEBHOOK_HANDLERS["customer.subscription.updated"];
    expect(STRIPE_WEBHOOK_HANDLERS["customer.subscription.deleted"]).toBe(
      handler,
    );
    expect(STRIPE_WEBHOOK_HANDLERS["customer.subscription.paused"]).toBe(
      handler,
    );
    expect(STRIPE_WEBHOOK_HANDLERS["customer.subscription.resumed"]).toBe(
      handler,
    );
  });
});

describe("containsDemoIdentifier", () => {
  it("flags a demo-namespaced event id", () => {
    expect(containsDemoIdentifier(fakeEvent({ id: "demo_evt" }))).toBe(true);
  });

  it("flags a demo subscription referenced in the payload", () => {
    expect(
      containsDemoIdentifier(
        fakeEvent({ data: { object: { subscription: "demo_subscription" } } }),
      ),
    ).toBe(true);
  });

  it("passes a real event through", () => {
    expect(
      containsDemoIdentifier(
        fakeEvent({ data: { object: { customer: "cus_123" } } }),
      ),
    ).toBe(false);
  });
});
