import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";
import { Hono } from "hono";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

// DB-free coverage for the billing hardening: exclusive webhook claims,
// stale/foreign subscription events, trial eligibility, single live
// subscription at checkout, and the pause end-date clamp.

// ── Chainable db mock: each terminal await pops the next queued result ──
type Kind = "insert" | "select" | "update";
const results: Record<Kind, unknown[]> = { insert: [], select: [], update: [] };
const calls: { kind: Kind; method: string; args: unknown[] }[] = [];

function chain(kind: Kind) {
  const c: Record<string, unknown> = {};
  for (const m of [
    "values",
    "onConflictDoUpdate",
    "returning",
    "from",
    "innerJoin",
    "where",
    "limit",
    "set",
  ]) {
    c[m] = (...args: unknown[]) => {
      calls.push({ kind, method: m, args });
      return c;
    };
  }
  c.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
    Promise.resolve(results[kind].shift()).then(res, rej);
  return c;
}

vi.mock("@focusflow/db", async () => {
  const actual =
    await vi.importActual<typeof import("@focusflow/db")>("@focusflow/db");
  return {
    ...actual,
    db: {
      insert: () => chain("insert"),
      select: () => chain("select"),
      update: () => chain("update"),
    },
  };
});

const retrieveMock = vi.fn();
const sessionsCreateMock = vi.fn();
vi.mock("../lib/stripe", async () => {
  const actual =
    await vi.importActual<typeof import("../lib/stripe")>("../lib/stripe");
  return {
    ...actual,
    getStripe: () => ({
      subscriptions: { retrieve: retrieveMock },
      checkout: { sessions: { create: sessionsCreateMock } },
      customers: { create: vi.fn() },
      webhooks: {
        constructEvent: (body: string) => JSON.parse(body),
      },
    }),
    getWebhookSecret: () => "whsec_test",
    resolvePriceId: async () => "price_annual",
  };
});

vi.mock("../middleware/auth", () => ({
  authMiddleware: async (
    c: { set: (k: string, v: unknown) => void },
    next: () => Promise<void>,
  ) => {
    c.set("user", { id: "user_1", email: "p@example.com", name: "Parent" });
    await next();
  },
  requireSession: async (_c: unknown, next: () => Promise<void>) => next(),
}));

vi.mock("../lib/analytics-events", () => ({
  recordServerEvent: vi.fn(async () => undefined),
}));

const { addMonthsClamped } = await import("../lib/billing/dates");
const { claimEvent } = await import("../lib/billing/webhook-ledger");
const { upsertSubscriptionFromStripe } = await import(
  "../lib/billing/subscription-sync"
);
const { STRIPE_WEBHOOK_HANDLERS } = await import(
  "../lib/billing/webhook-handlers"
);
const { stripeWebhookRoute } = await import("../routes/stripe-webhook");
const { billingRoutes } = await import("../routes/billing");

const dialect = new PgDialect();
const render = (s: SQL) => dialect.sqlToQuery(s).sql;

function conflictArgs() {
  const call = calls.find((c) => c.method === "onConflictDoUpdate");
  return call?.args[0] as { set: Record<string, unknown>; setWhere?: SQL };
}

function fakeSub(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "sub_B",
    customer: "cus_1",
    status: "active",
    cancel_at_period_end: false,
    items: {
      data: [
        {
          current_period_end: 1_900_000_000,
          price: { id: "price_annual", recurring: { interval: "year" } },
        },
      ],
    },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

const evt = (overrides: Record<string, unknown> = {}) =>
  ({
    id: "evt_1",
    type: "customer.subscription.updated",
    data: { object: fakeSub() },
    ...overrides,
  }) as unknown as Stripe.Event;

beforeEach(() => {
  results.insert = [];
  results.select = [];
  results.update = [];
  calls.length = 0;
  retrieveMock.mockReset();
  sessionsCreateMock.mockReset();
  sessionsCreateMock.mockResolvedValue({ url: "https://checkout.test" });
});

describe("addMonthsClamped", () => {
  it("clamps Jan 31 + 1 month to the end of February", () => {
    expect(
      addMonthsClamped(new Date("2026-01-31T10:00:00Z"), 1).toISOString(),
    ).toBe("2026-02-28T10:00:00.000Z");
    expect(
      addMonthsClamped(new Date("2028-01-31T10:00:00Z"), 1).toISOString(),
    ).toBe("2028-02-29T10:00:00.000Z");
  });

  it("clamps across a year boundary and keeps plain dates intact", () => {
    expect(
      addMonthsClamped(new Date("2026-12-31T00:00:00Z"), 2).toISOString(),
    ).toBe("2027-02-28T00:00:00.000Z");
    expect(
      addMonthsClamped(new Date("2026-03-15T08:30:00Z"), 3).toISOString(),
    ).toBe("2026-06-15T08:30:00.000Z");
  });
});

describe("claimEvent", () => {
  it("claims with a conditional upsert guarded by processed_at and the lease", async () => {
    results.insert.push([{ attempts: 1 }]);
    expect(await claimEvent(evt())).toEqual({ status: "claim", attempts: 1 });
    const where = render(conflictArgs().setWhere!);
    expect(where).toContain('"processed_at" is null');
    expect(where).toContain('"claimed_at" is null');
    expect(where).toContain('"claimed_at" <');
  });

  it("reports in_flight when another delivery holds the lease", async () => {
    results.insert.push([]);
    results.select.push([{ processedAt: null }]);
    expect(await claimEvent(evt())).toEqual({ status: "in_flight" });
  });

  it("reports duplicate when the event was already processed", async () => {
    results.insert.push([]);
    results.select.push([{ processedAt: new Date() }]);
    expect(await claimEvent(evt())).toEqual({ status: "duplicate" });
  });

  it("quarantines after too many attempts", async () => {
    results.insert.push([{ attempts: 6 }]);
    expect((await claimEvent(evt())).status).toBe("quarantined");
  });
});

describe("stripe webhook route", () => {
  const app = new Hono().route("/", stripeWebhookRoute);
  const post = (event: Stripe.Event) =>
    app.request("/", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=x" },
      body: JSON.stringify(event),
    });

  it("does not run the handler for an in-flight duplicate", async () => {
    results.insert.push([]);
    results.select.push([{ processedAt: null }]);
    const res = await post(evt());
    expect(res.status).toBe(409);
    expect(retrieveMock).not.toHaveBeenCalled();
  });

  it("acks a processed duplicate with 200 without re-running", async () => {
    results.insert.push([]);
    results.select.push([{ processedAt: new Date() }]);
    const res = await post(evt());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ duplicate: true });
    expect(retrieveMock).not.toHaveBeenCalled();
  });

  it("releases the lease when the handler fails so a retry can claim", async () => {
    results.insert.push([{ attempts: 1 }]); // claim
    results.select.push([{ id: "user_1" }]); // resolveUserIdFromCustomer
    retrieveMock.mockRejectedValue(new Error("stripe down"));
    const res = await post(evt());
    expect(res.status).toBe(500);
    const release = calls.find(
      (c) =>
        c.kind === "update" &&
        c.method === "set" &&
        (c.args[0] as Record<string, unknown>).claimedAt === null &&
        !("processedAt" in (c.args[0] as Record<string, unknown>)),
    );
    expect(release).toBeDefined();
  });
});

describe("upsertSubscriptionFromStripe", () => {
  it("lets a live subscription replace the row unconditionally", async () => {
    results.insert.push([{ id: "row" }]);
    expect(await upsertSubscriptionFromStripe("user_1", fakeSub())).toBe(true);
    expect(conflictArgs().setWhere).toBeUndefined();
  });

  it("guards a dead subscription so it cannot overwrite another live one", async () => {
    results.insert.push([]); // conflict row did not match setWhere
    const applied = await upsertSubscriptionFromStripe(
      "user_1",
      fakeSub({ id: "sub_A", status: "canceled" }),
    );
    expect(applied).toBe(false);
    const q = dialect.sqlToQuery(conflictArgs().setWhere!);
    expect(q.sql).toContain('"stripe_subscription_id" =');
    expect(q.sql).toContain('"status" not in');
    expect(q.params).toContain("sub_A");
  });

  it("resets trialReminderSentAt when the subscription id changes", async () => {
    results.insert.push([{ id: "row" }]);
    await upsertSubscriptionFromStripe("user_1", fakeSub());
    const q = dialect.sqlToQuery(conflictArgs().set.trialReminderSentAt as SQL);
    expect(q.sql).toMatch(/CASE WHEN .*"stripe_subscription_id" = .* ELSE NULL END/);
    expect(q.params).toContain("sub_B");
  });
});

describe("subscription state-change handler", () => {
  it("writes the subscription re-read from Stripe, not the event payload", async () => {
    results.select.push([{ id: "user_1" }]);
    results.insert.push([{ id: "row" }]);
    retrieveMock.mockResolvedValue(fakeSub({ id: "sub_A", status: "canceled" }));
    await STRIPE_WEBHOOK_HANDLERS["customer.subscription.updated"]!(
      evt({ data: { object: fakeSub({ id: "sub_A", status: "active" }) } }),
    );
    expect(retrieveMock).toHaveBeenCalledWith("sub_A");
    const values = calls.find((c) => c.method === "values")!.args[0] as {
      status: string;
    };
    expect(values.status).toBe("canceled");
  });
});

describe("POST /checkout", () => {
  const app = new Hono().route("/", billingRoutes);
  const checkout = () =>
    app.request("/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "annual" }),
    });

  it("refuses a second subscription while one is live in Stripe", async () => {
    results.select.push([{ stripeSubscriptionId: "sub_A", status: "active" }]);
    retrieveMock.mockResolvedValue(fakeSub({ id: "sub_A", status: "active" }));
    const res = await checkout();
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      code: "SUBSCRIPTION_ALREADY_ACTIVE",
    });
    expect(sessionsCreateMock).not.toHaveBeenCalled();
  });

  it("grants the 14-day trial to a first-time subscriber", async () => {
    results.select.push([]); // no subscription row
    results.select.push([{ stripeCustomerId: "cus_1" }]);
    const res = await checkout();
    expect(res.status).toBe(200);
    expect(sessionsCreateMock.mock.calls[0]![0].subscription_data).toEqual({
      trial_period_days: 14,
    });
  });

  it("does not grant a second trial to a returning subscriber", async () => {
    results.select.push([{ stripeSubscriptionId: "sub_A", status: "canceled" }]);
    results.select.push([{ stripeCustomerId: "cus_1" }]);
    const res = await checkout();
    expect(res.status).toBe(200);
    expect(sessionsCreateMock.mock.calls[0]![0].subscription_data).toBeUndefined();
  });
});
