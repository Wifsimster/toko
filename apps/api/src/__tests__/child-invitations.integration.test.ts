// Integration test suite for the co-parent flows. Skips entirely unless
// INTEGRATION_DB=1 is set — see helpers/test-db.ts. Run locally with:
//
//   docker compose -f compose.local.yml up -d postgres
//   DATABASE_URL=postgres://toko:toko_secret@localhost:5432/toko_test \
//     INTEGRATION_DB=1 \
//     DB_ENCRYPTION_KEY=$(openssl rand -hex 32) \
//     pnpm --filter @focusflow/api test
//
// CI sets these on the lint-test job (.github/workflows/ci.yml).
import { vi } from "vitest";

// IMPORTANT: vi.mock calls are hoisted above imports, so the auth
// middleware is replaced before app.ts loads its routes.
vi.mock("../middleware/auth", async () => {
  const { testAuthMiddleware, testRequireSession } = await import(
    "./helpers/auth-mock"
  );
  return {
    authMiddleware: testAuthMiddleware,
    requireSession: testRequireSession,
  };
});

// Stub Resend so the invite POST doesn't 500 in CI: production refuses to
// create an invite if the email never went out, which is correct, but in
// tests we just need to know the route would have called sendEmail.
vi.mock("../lib/email", () => ({
  sendEmail: vi.fn(async () => ({ sent: true, id: "test-message-id" })),
}));

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@focusflow/db";
import {
  childAccess,
  childInvitations,
  consents,
} from "@focusflow/db";
import { app } from "../app";
import {
  ensureMigrations,
  truncateAll,
  integrationDbAvailable,
} from "./helpers/test-db";
import {
  createChild,
  createUser,
  createPendingInvite,
  hashToken,
} from "./helpers/fixtures";
import { TEST_USER_HEADER } from "./helpers/auth-mock";

const skip = !integrationDbAvailable;

describe.skipIf(skip)("co-parent invitations — DB integration", () => {
  beforeAll(async () => {
    await ensureMigrations();
  });

  afterEach(async () => {
    await truncateAll();
  });

  describe("POST /api/child-invitations", () => {
    it("creates an invite + parental-authority consent row when owner attests", async () => {
      const owner = await createUser({ name: "Sophie" });
      const child = await createChild({ ownerId: owner.id, name: "Léa" });

      const res = await app.request("/api/child-invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [TEST_USER_HEADER]: owner.id,
        },
        body: JSON.stringify({
          childId: child.id,
          email: "marc@famille.fr",
          parentalAuthorityAttestation: true,
        }),
      });
      expect(res.status).toBe(200);

      const invites = await db
        .select()
        .from(childInvitations)
        .where(eq(childInvitations.childId, child.id));
      expect(invites).toHaveLength(1);
      expect(invites[0]!.invitedEmail).toBe("marc@famille.fr");
      expect(invites[0]!.acceptedAt).toBeNull();

      const consentRows = await db
        .select()
        .from(consents)
        .where(eq(consents.userId, owner.id));
      expect(consentRows).toHaveLength(1);
      expect(consentRows[0]!.type).toBe("parental_authority_attestation");
    });

    it("rejects 422 when the attestation is missing", async () => {
      const owner = await createUser();
      const child = await createChild({ ownerId: owner.id });

      const res = await app.request("/api/child-invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [TEST_USER_HEADER]: owner.id,
        },
        body: JSON.stringify({
          childId: child.id,
          email: "marc@famille.fr",
        }),
      });
      expect(res.status).toBe(422);
    });

    it("blocks self-invite with 403", async () => {
      const owner = await createUser({ email: "self@famille.fr" });
      const child = await createChild({ ownerId: owner.id });

      const res = await app.request("/api/child-invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [TEST_USER_HEADER]: owner.id,
        },
        body: JSON.stringify({
          childId: child.id,
          email: "self@famille.fr",
          parentalAuthorityAttestation: true,
        }),
      });
      expect(res.status).toBe(403);
    });

    it("returns alreadyMember:true without writing when invitee is already a co-parent", async () => {
      const owner = await createUser();
      const coParent = await createUser({ email: "marc@famille.fr" });
      const child = await createChild({ ownerId: owner.id });
      await db.insert(childAccess).values({
        childId: child.id,
        userId: coParent.id,
        role: "co_parent",
      });

      const res = await app.request("/api/child-invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [TEST_USER_HEADER]: owner.id,
        },
        body: JSON.stringify({
          childId: child.id,
          email: "marc@famille.fr",
          parentalAuthorityAttestation: true,
        }),
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { alreadyMember?: boolean };
      expect(body.alreadyMember).toBe(true);

      const invites = await db
        .select()
        .from(childInvitations)
        .where(eq(childInvitations.childId, child.id));
      expect(invites).toHaveLength(0);
    });
  });

  describe("POST /api/child-invitations/:token/accept", () => {
    it("happy path: creates child_access + co-parent consent + flips acceptedAt", async () => {
      const owner = await createUser();
      const child = await createChild({ ownerId: owner.id });
      const invitee = await createUser({
        email: "marc@famille.fr",
        emailVerified: true,
      });
      const { token, id: inviteId } = await createPendingInvite({
        childId: child.id,
        invitedBy: owner.id,
        invitedEmail: "marc@famille.fr",
      });

      const res = await app.request(
        `/api/child-invitations/${token}/accept`,
        {
          method: "POST",
          headers: { [TEST_USER_HEADER]: invitee.id },
        },
      );
      expect(res.status).toBe(200);

      const access = await db
        .select()
        .from(childAccess)
        .where(
          and(
            eq(childAccess.childId, child.id),
            eq(childAccess.userId, invitee.id),
          ),
        );
      expect(access).toHaveLength(1);
      expect(access[0]!.role).toBe("co_parent");

      const consentRows = await db
        .select()
        .from(consents)
        .where(eq(consents.userId, invitee.id));
      expect(consentRows).toHaveLength(1);
      expect(consentRows[0]!.type).toBe("co_parent_health_processing");

      const [invite] = await db
        .select()
        .from(childInvitations)
        .where(eq(childInvitations.id, inviteId));
      expect(invite!.acceptedAt).not.toBeNull();
    });

    it("returns 404 (no leak as 403) when the signed-in email doesn't match", async () => {
      const owner = await createUser();
      const child = await createChild({ ownerId: owner.id });
      const wrongUser = await createUser({
        email: "other@famille.fr",
        emailVerified: true,
      });
      const { token } = await createPendingInvite({
        childId: child.id,
        invitedBy: owner.id,
        invitedEmail: "marc@famille.fr",
      });

      const res = await app.request(
        `/api/child-invitations/${token}/accept`,
        {
          method: "POST",
          headers: { [TEST_USER_HEADER]: wrongUser.id },
        },
      );
      expect(res.status).toBe(404);
    });

    it("returns 403 when the invitee's email is not yet verified", async () => {
      const owner = await createUser();
      const child = await createChild({ ownerId: owner.id });
      const unverified = await createUser({
        email: "marc@famille.fr",
        emailVerified: false,
      });
      const { token } = await createPendingInvite({
        childId: child.id,
        invitedBy: owner.id,
        invitedEmail: "marc@famille.fr",
      });

      const res = await app.request(
        `/api/child-invitations/${token}/accept`,
        {
          method: "POST",
          headers: { [TEST_USER_HEADER]: unverified.id },
        },
      );
      expect(res.status).toBe(403);
    });

    it("rejects a second accept of the same token with 404 (idempotent)", async () => {
      const owner = await createUser();
      const child = await createChild({ ownerId: owner.id });
      const invitee = await createUser({
        email: "marc@famille.fr",
        emailVerified: true,
      });
      const { token } = await createPendingInvite({
        childId: child.id,
        invitedBy: owner.id,
        invitedEmail: "marc@famille.fr",
      });

      const first = await app.request(
        `/api/child-invitations/${token}/accept`,
        {
          method: "POST",
          headers: { [TEST_USER_HEADER]: invitee.id },
        },
      );
      expect(first.status).toBe(200);

      const second = await app.request(
        `/api/child-invitations/${token}/accept`,
        {
          method: "POST",
          headers: { [TEST_USER_HEADER]: invitee.id },
        },
      );
      expect(second.status).toBe(404);

      // Exactly one access row, regardless of replay attempts.
      const access = await db
        .select()
        .from(childAccess)
        .where(
          and(
            eq(childAccess.childId, child.id),
            eq(childAccess.userId, invitee.id),
          ),
        );
      expect(access).toHaveLength(1);
    });
  });

  describe("DELETE /api/child-access/child/:childId/user/:userId", () => {
    it("revoke deletes pending invites for the same email so a stale link can't undo it", async () => {
      const owner = await createUser();
      const coParent = await createUser({
        email: "marc@famille.fr",
        emailVerified: true,
      });
      const child = await createChild({ ownerId: owner.id });
      // Co-parent already accepted a previous invite (so they're a member).
      await db.insert(childAccess).values({
        childId: child.id,
        userId: coParent.id,
        role: "co_parent",
      });
      // Owner had also fired off ANOTHER invite that's still pending. The
      // canonical exploit: revoke the co-parent, they re-accept via the
      // pending email link, access restored.
      const stale = await createPendingInvite({
        childId: child.id,
        invitedBy: owner.id,
        invitedEmail: "marc@famille.fr",
      });

      const res = await app.request(
        `/api/child-access/child/${child.id}/user/${coParent.id}`,
        { method: "DELETE", headers: { [TEST_USER_HEADER]: owner.id } },
      );
      expect(res.status).toBe(200);

      const accessLeft = await db
        .select()
        .from(childAccess)
        .where(
          and(
            eq(childAccess.childId, child.id),
            eq(childAccess.userId, coParent.id),
          ),
        );
      expect(accessLeft).toHaveLength(0);

      // The pending invite must be gone too — the security fix.
      const invites = await db
        .select()
        .from(childInvitations)
        .where(eq(childInvitations.id, stale.id));
      expect(invites).toHaveLength(0);
    });
  });

  describe("GET /api/child-invitations/:token (public lookup)", () => {
    it("returns childName + inviterName but NEVER invitedEmail", async () => {
      const owner = await createUser({ name: "Sophie" });
      const child = await createChild({ ownerId: owner.id, name: "Léa" });
      const { token } = await createPendingInvite({
        childId: child.id,
        invitedBy: owner.id,
        invitedEmail: "marc@famille.fr",
      });

      const res = await app.request(`/api/child-invitations/${token}`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expect(body.childName).toBe("Léa");
      expect(body.inviterName).toBe("Sophie");
      expect(body).not.toHaveProperty("invitedEmail");
    });

    it("returns 404 once an invite has been accepted (replay defense)", async () => {
      const owner = await createUser();
      const child = await createChild({ ownerId: owner.id });
      const { token, id } = await createPendingInvite({
        childId: child.id,
        invitedBy: owner.id,
        invitedEmail: "marc@famille.fr",
      });
      // Mark accepted directly to avoid coupling this test to the accept route.
      await db
        .update(childInvitations)
        .set({ acceptedAt: new Date() })
        .where(eq(childInvitations.id, id));

      const res = await app.request(`/api/child-invitations/${token}`);
      expect(res.status).toBe(404);
    });

    it("does not match a token by an unrelated user via timing/lookup", async () => {
      const owner = await createUser();
      const child = await createChild({ ownerId: owner.id });
      await createPendingInvite({
        childId: child.id,
        invitedBy: owner.id,
        invitedEmail: "marc@famille.fr",
      });

      // Random valid-shape token that won't match any tokenHash.
      const random = "f".repeat(64);
      const res = await app.request(`/api/child-invitations/${random}`);
      expect(res.status).toBe(404);
      // The unrelated invite is still pending — we shouldn't have touched it.
      const stillPending = await db
        .select()
        .from(childInvitations)
        .where(isNull(childInvitations.acceptedAt));
      expect(stillPending).toHaveLength(1);
    });
  });
});

// Reference unused imports so TS doesn't strip them when the suite is skipped.
void hashToken;
