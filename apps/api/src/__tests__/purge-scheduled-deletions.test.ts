import { describe, it, expect, vi, beforeEach } from "vitest";

// The purge job is pure orchestration over drizzle + Stripe, so both are
// mocked before import: no Postgres harness, no live Stripe call.
const dueUsers: Array<{ id: string; stripeCustomerId: string | null }> = [];
const subRows: Array<{
  stripeSubscriptionId: string;
  status: string;
  stripeCustomerId: string | null;
}> = [];
const deleteWhereMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@focusflow/db", async () => {
  const actual =
    await vi.importActual<typeof import("@focusflow/db")>("@focusflow/db");
  return {
    ...actual,
    db: {
      // First select() resolves the due users, the second the subscription.
      // The job distinguishes them by chaining .limit() only on the latter.
      select: () => ({
        from: () => ({
          where: () => {
            const rows = dueUsers;
            return Object.assign(Promise.resolve(rows), {
              limit: () => Promise.resolve(subRows),
            });
          },
        }),
      }),
      delete: () => ({ where: deleteWhereMock }),
    },
  };
});

const cancelMock = vi.fn();
const customerDelMock = vi.fn().mockResolvedValue(undefined);
vi.mock("../lib/stripe", () => ({
  getStripe: () => ({
    subscriptions: { cancel: cancelMock },
    customers: { del: customerDelMock },
  }),
}));

const { runPurgeScheduledDeletions } = await import(
  "../jobs/purge-scheduled-deletions"
);

function stripeError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode });
}

beforeEach(() => {
  dueUsers.length = 0;
  subRows.length = 0;
  deleteWhereMock.mockClear();
  cancelMock.mockReset().mockResolvedValue(undefined);
  customerDelMock.mockClear();
});

describe("runPurgeScheduledDeletions", () => {
  it("purges the user when the subscription is already gone from Stripe", async () => {
    // The regression: a row still marked "active" locally whose Stripe
    // subscription no longer exists. Cancelling threw 404, the whole purge
    // aborted, and the account survived every cron tick — rule F3 broken
    // silently while the user's data stayed put.
    dueUsers.push({ id: "u1", stripeCustomerId: "cus_1" });
    subRows.push({
      stripeSubscriptionId: "demo_subscription",
      status: "active",
      stripeCustomerId: "cus_1",
    });
    cancelMock.mockRejectedValue(
      stripeError(404, "No such subscription: 'demo_subscription'"),
    );

    const result = await runPurgeScheduledDeletions();

    expect(result.purged).toBe(1);
    expect(deleteWhereMock).toHaveBeenCalledOnce();
  });

  it("keeps the user when Stripe fails for any other reason", async () => {
    // Erasure must reach Stripe before the local row goes away, so a real
    // outage has to leave deletionScheduledAt set for the next tick.
    dueUsers.push({ id: "u2", stripeCustomerId: "cus_2" });
    subRows.push({
      stripeSubscriptionId: "sub_2",
      status: "active",
      stripeCustomerId: "cus_2",
    });
    cancelMock.mockRejectedValue(stripeError(500, "Stripe is down"));

    const result = await runPurgeScheduledDeletions();

    expect(result.purged).toBe(0);
    expect(deleteWhereMock).not.toHaveBeenCalled();
  });

  it("cancels a live subscription then deletes the user", async () => {
    dueUsers.push({ id: "u3", stripeCustomerId: "cus_3" });
    subRows.push({
      stripeSubscriptionId: "sub_3",
      status: "active",
      stripeCustomerId: "cus_3",
    });

    const result = await runPurgeScheduledDeletions();

    expect(cancelMock).toHaveBeenCalledWith("sub_3");
    expect(customerDelMock).toHaveBeenCalledWith("cus_3");
    expect(result.purged).toBe(1);
  });

  it("does nothing when no deletion is due", async () => {
    const result = await runPurgeScheduledDeletions();
    expect(result.purged).toBe(0);
    expect(cancelMock).not.toHaveBeenCalled();
  });
});
