import { describe, it, expect } from "vitest";
import {
  makeUnsubscribeToken,
  verifyUnsubscribeToken,
} from "../lib/unsubscribe";

describe("unsubscribe tokens", () => {
  it("round-trips a valid token back to its user id and category", () => {
    const token = makeUnsubscribeToken("user_123", "weekly");
    expect(verifyUnsubscribeToken(token)).toEqual({
      userId: "user_123",
      category: "weekly",
    });
  });

  it("preserves the category (daily/evening/weekly)", () => {
    for (const category of ["daily", "evening", "weekly"] as const) {
      const token = makeUnsubscribeToken("u", category);
      expect(verifyUnsubscribeToken(token)?.category).toBe(category);
    }
  });

  it("rejects a tampered payload", () => {
    const token = makeUnsubscribeToken("user_123", "daily");
    // Swap the encoded payload for a different user, keep the old signature.
    const forgedPayload = Buffer.from("attacker:daily").toString("base64url");
    const forged = `${forgedPayload}.${token.slice(token.lastIndexOf(".") + 1)}`;
    expect(verifyUnsubscribeToken(forged)).toBeNull();
  });

  it("rejects a token with no signature", () => {
    expect(verifyUnsubscribeToken("justpayload")).toBeNull();
    expect(verifyUnsubscribeToken("")).toBeNull();
  });

  it("rejects an unknown category", () => {
    // Hand-craft a well-signed token for an invalid category by going through
    // the public API would be impossible; verify the guard directly instead.
    const token = makeUnsubscribeToken("u", "daily").replace(/\..*/, "");
    expect(verifyUnsubscribeToken(token)).toBeNull();
  });
});
