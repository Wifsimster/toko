import { describe, it, expect, vi, beforeEach } from "vitest";

// We mock the db before importing the app so the route's INSERT call is
// intercepted without needing a Postgres harness in CI.
const insertValuesMock = vi.fn().mockResolvedValue(undefined);
vi.mock("@focusflow/db", async () => {
  const actual =
    await vi.importActual<typeof import("@focusflow/db")>("@focusflow/db");
  return {
    ...actual,
    db: {
      insert: () => ({ values: insertValuesMock }),
    },
  };
});

const { app } = await import("../app");

describe("POST /api/events", () => {
  beforeEach(() => {
    insertValuesMock.mockClear();
  });

  it("accepts a valid event without a session and inserts with parentId=null", async () => {
    const res = await app.request("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "signup_completed",
        sessionId: "s_test_123",
      }),
    });
    expect(res.status).toBe(204);
    expect(insertValuesMock).toHaveBeenCalledOnce();
    const row = insertValuesMock.mock.calls[0]![0];
    expect(row.parentId).toBeNull();
    expect(row.eventName).toBe("signup_completed");
    expect(row.sessionId).toBe("s_test_123");
  });

  it("rejects an unknown event name with 422", async () => {
    const res = await app.request("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "rogue_event",
        sessionId: "s_test_123",
      }),
    });
    expect(res.status).toBe(422);
    expect(insertValuesMock).not.toHaveBeenCalled();
  });

  it("rejects a body missing sessionId with 422", async () => {
    const res = await app.request("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName: "paywall_viewed" }),
    });
    expect(res.status).toBe(422);
    expect(insertValuesMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed JSON body with 422", async () => {
    const res = await app.request("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    expect(res.status).toBe(422);
    expect(insertValuesMock).not.toHaveBeenCalled();
  });
});
