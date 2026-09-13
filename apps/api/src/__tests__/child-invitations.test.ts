import { describe, it, expect } from "vitest";
import {
  hashToken,
  INVITE_TTL_DAYS,
  inviteExpiry,
  newInviteToken,
} from "../lib/child-invitations/tokens";
import { randomBytes } from "node:crypto";
import {
  inviteSchema,
  acceptInviteParamsSchema,
} from "@focusflow/validators";

// hashToken is the shipped implementation, imported above. It used to be
// private to routes/child-invitations.ts, so this file carried a copy of it
// and tested that — which proved nothing about the route.

describe("child invitation validators", () => {
  it("inviteSchema requires a valid email AND a parental-authority attestation", () => {
    expect(
      inviteSchema.safeParse({
        email: "co@famille.fr",
        parentalAuthorityAttestation: true,
      }).success,
    ).toBe(true);

    // No attestation → reject (RGPD Art. 9(2)(a) gate).
    expect(
      inviteSchema.safeParse({ email: "co@famille.fr" }).success,
    ).toBe(false);
    expect(
      inviteSchema.safeParse({
        email: "co@famille.fr",
        parentalAuthorityAttestation: false,
      }).success,
    ).toBe(false);

    expect(
      inviteSchema.safeParse({
        email: "not-an-email",
        parentalAuthorityAttestation: true,
      }).success,
    ).toBe(false);
    expect(
      inviteSchema.safeParse({
        email: "",
        parentalAuthorityAttestation: true,
      }).success,
    ).toBe(false);
  });

  it("acceptInviteParamsSchema rejects short tokens (entropy floor)", () => {
    expect(
      acceptInviteParamsSchema.safeParse({ token: "abc" }).success,
    ).toBe(false);

    // 32 hex bytes — what the route generates.
    const token = randomBytes(32).toString("hex");
    expect(acceptInviteParamsSchema.safeParse({ token }).success).toBe(true);
  });
});

describe("invitation token hashing", () => {
  it("hashToken is deterministic and returns 64 hex chars (sha256)", () => {
    const token = "deadbeef".repeat(8);
    const h1 = hashToken(token);
    const h2 = hashToken(token);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("different tokens hash to different digests", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });
});

describe("invitation tokens", () => {
  it("mints a 256-bit token", () => {
    expect(newInviteToken()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("never mints the same token twice", () => {
    expect(newInviteToken()).not.toBe(newInviteToken());
  });

  it("stores only the hash, so a leaked row cannot be replayed", () => {
    const token = newInviteToken();
    const stored = hashToken(token);
    expect(stored).not.toBe(token);
    expect(stored).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).toBe(stored);
  });

  it("expires after the TTL", () => {
    const from = new Date("2026-03-01T12:00:00Z");
    expect(inviteExpiry(from).toISOString()).toBe(
      new Date("2026-03-15T12:00:00Z").toISOString(),
    );
    expect(INVITE_TTL_DAYS).toBe(14);
  });
});
