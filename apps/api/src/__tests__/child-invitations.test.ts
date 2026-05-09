import { describe, it, expect } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import {
  inviteSchema,
  acceptInviteParamsSchema,
} from "@focusflow/validators";

// Mirrors the (intentionally module-private) hashToken in
// routes/child-invitations.ts. If this drifts the route stops being able
// to look up its own invitations — keep them aligned.
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

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
