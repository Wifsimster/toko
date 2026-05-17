import { Hono } from "hono";
import { and, eq, gt, inArray, isNull } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import {
  db,
  children,
  childAccess,
  childInvitations,
  consents,
  user as userTable,
} from "@focusflow/db";
import {
  inviteSchema,
  bulkInviteSchema,
  acceptInviteParamsSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { rateLimiter } from "../middleware/rate-limiter";
import { AppError } from "../middleware/error-handler";
import { assertChildOwner } from "../lib/child-access";
import { logAudit } from "../lib/audit";
import { sendEmail } from "../lib/email";
import {
  buildInviteEmail,
  buildBulkInviteEmail,
  buildAcceptanceEmail,
} from "../lib/co-parent-emails";
import { env } from "../lib/env";
import type { AppEnv } from "../types";

export const childInvitationsRoutes = new Hono<AppEnv>();

const INVITE_TTL_DAYS = 14;
const TOKEN_BYTES = 32; // 256 bits — matches Better Auth's verification token strength.

// Bumped whenever the inviter-facing attestation copy changes — pins the
// consent row to the exact wording the user agreed to.
const PARENTAL_AUTHORITY_VERSION = "2026-05-09";
// Same idea on the invitee side (Art. 9(2)(a) RGPD consent text).
const COPARENT_HEALTH_VERSION = "2026-05-09";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function appOrigin(): string {
  return env.CORS_ORIGIN || "http://localhost:5173";
}

// Cap: an owner can send 5 fresh invites per hour across all their children.
// Stops the brand from being weaponised as a free email blaster, and Resend
// cost overruns if a key leaks.
const inviteRateLimiter = rateLimiter({
  namespace: "child-invitations-create",
  windowMs: 60 * 60_000,
  limit: 5,
  keyBy: "user",
});

// Accept rate-limit is per-IP rather than per-user — the invitee may not
// even have a Tokō account when they hit this endpoint.
const acceptRateLimiter = rateLimiter({
  namespace: "child-invitations-accept",
  windowMs: 60_000,
  limit: 10,
});

// Per-IP rate limit on the public GET — bearer tokens are 256 bits so brute
// force is infeasible, but cap probing anyway.
const tokenLookupRateLimiter = rateLimiter({
  namespace: "child-invitations-lookup",
  windowMs: 60_000,
  limit: 30,
});

// Public lookup of an invitation's metadata. Doesn't require auth — the
// invitee uses it to render an "accepter l'invitation" screen before they
// know whether they need to sign up. Returns 404 on miss/expired/used so
// invitation existence isn't leakable.
//
// Deliberately does NOT return the `invitedEmail`: a forwarded link would
// otherwise expose which address was invited to which child (a real concern
// for separated households). The accept endpoint still enforces the email
// match server-side, and the UI surfaces a hint via `currentEmail` when the
// signed-in account is wrong.
childInvitationsRoutes.get("/:token", tokenLookupRateLimiter, async (c) => {
  const token = c.req.param("token");
  const parsed = acceptInviteParamsSchema.safeParse({ token });
  if (!parsed.success) {
    throw new AppError("NOT_FOUND", "Invitation introuvable", 404);
  }

  const tokenHash = hashToken(parsed.data.token);

  const [row] = await db
    .select({
      id: childInvitations.id,
      childId: childInvitations.childId,
      batchId: childInvitations.batchId,
      expiresAt: childInvitations.expiresAt,
      acceptedAt: childInvitations.acceptedAt,
      childName: children.name,
      inviterName: userTable.name,
    })
    .from(childInvitations)
    .innerJoin(children, eq(children.id, childInvitations.childId))
    .innerJoin(userTable, eq(userTable.id, childInvitations.invitedBy))
    .where(eq(childInvitations.tokenHash, tokenHash))
    .limit(1);

  if (!row || row.acceptedAt || row.expiresAt < new Date()) {
    throw new AppError("NOT_FOUND", "Invitation introuvable ou expirée", 404);
  }

  // Bulk invitation: the email-bearing token lives on one row, but the
  // batch_id ties together the sibling rows. Return all of them so the
  // acceptance page can show "Léa, Tom, Inès" before the click.
  const siblings = row.batchId
    ? await db
        .select({
          childId: childInvitations.childId,
          childName: children.name,
          acceptedAt: childInvitations.acceptedAt,
          expiresAt: childInvitations.expiresAt,
        })
        .from(childInvitations)
        .innerJoin(children, eq(children.id, childInvitations.childId))
        .where(eq(childInvitations.batchId, row.batchId))
    : [{
        childId: row.childId,
        childName: row.childName,
        acceptedAt: row.acceptedAt,
        expiresAt: row.expiresAt,
      }];

  const pendingChildren = siblings
    .filter((s) => !s.acceptedAt && s.expiresAt >= new Date())
    .map((s) => ({ id: s.childId, name: s.childName }));

  // If every sibling has been accepted or expired, treat as gone.
  if (pendingChildren.length === 0) {
    throw new AppError("NOT_FOUND", "Invitation introuvable ou expirée", 404);
  }

  return c.json({
    inviterName: row.inviterName ?? "Un parent",
    expiresAt: row.expiresAt,
    children: pendingChildren,
    // Back-compat: single-child clients still read this field.
    childName: pendingChildren[0]?.name ?? row.childName,
  });
});

// List pending (not-yet-accepted, not-expired) invitations for a given child.
// Owner-only: a co-parent shouldn't see invites the owner is sending on the
// side, especially in separated-household scenarios.
childInvitationsRoutes.get("/", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  const childId = c.req.query("childId");
  if (!childId) {
    return c.json({ error: "childId requis" }, 400);
  }

  await assertChildOwner(currentUser.id, childId);

  const rows = await db
    .select({
      id: childInvitations.id,
      invitedEmail: childInvitations.invitedEmail,
      createdAt: childInvitations.createdAt,
      expiresAt: childInvitations.expiresAt,
    })
    .from(childInvitations)
    .where(
      and(
        eq(childInvitations.childId, childId),
        isNull(childInvitations.acceptedAt),
        gt(childInvitations.expiresAt, new Date()),
      ),
    )
    .orderBy(childInvitations.createdAt);

  return c.json(rows);
});

// Owner cancels a pending invite (typo in the email, change of heart, etc.).
// Already-accepted invites are no-ops here — to revoke a co-parent who has
// accepted, use DELETE /child-access/child/:childId/user/:userId.
childInvitationsRoutes.delete("/:id", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  const id = c.req.param("id");
  if (!id) {
    throw new AppError("NOT_FOUND", "Invitation introuvable", 404);
  }

  const [invite] = await db
    .select({
      id: childInvitations.id,
      childId: childInvitations.childId,
      invitedEmail: childInvitations.invitedEmail,
      acceptedAt: childInvitations.acceptedAt,
    })
    .from(childInvitations)
    .where(eq(childInvitations.id, id))
    .limit(1);

  if (!invite || invite.acceptedAt) {
    throw new AppError("NOT_FOUND", "Invitation introuvable", 404);
  }

  await assertChildOwner(currentUser.id, invite.childId);

  await db.delete(childInvitations).where(eq(childInvitations.id, id));

  void logAudit({
    actorId: currentUser.id,
    actorName: currentUser.name ?? null,
    childId: invite.childId,
    entityType: "child_invitation",
    entityId: invite.id,
    action: "cancel",
    summary: `Invitation annulée pour ${invite.invitedEmail}`,
  });

  return c.json({ ok: true });
});

// Bulk invite: share one or more children with a single co-parent in a single
// action. Constraints:
// - Owner-only on every child id in the payload (assertChildOwner per child).
// - Bounded enumerated list (max 20, enforced in the validator). The DPO
//   explicitly rejected wildcards / "future children auto-inclusion" — adding
//   a new child later requires a new invitation.
// - Creates N invitation rows sharing the same batch_id with scope="all_current".
//   Only the FIRST row carries the email-bearing token; the others have their
//   own unique-but-unused token hashes (preserves the existing UNIQUE constraint
//   on token_hash). Acceptance follows the batch_id, not the per-row token.
// - One parental_authority_attestation consent row per child (DPO: specificity
//   under RGPD Art. 9(2)(a) applies to inviter attestation too — authority
//   can differ per child in blended families).
// - Children already shared with this email are silently skipped (alreadyMember).
childInvitationsRoutes.post(
  "/bulk",
  authMiddleware,
  inviteRateLimiter,
  async (c) => {
    const currentUser = c.get("user");
    const body = await c.req.json().catch(() => ({}));

    const parsed = bulkInviteSchema.safeParse({
      email: body?.email,
      childIds: body?.childIds,
      parentalAuthorityAttestation: body?.parentalAuthorityAttestation,
    });
    if (!parsed.success) {
      return c.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        422,
      );
    }

    const invitedEmail = parsed.data.email.trim().toLowerCase();
    if (invitedEmail === currentUser.email.toLowerCase()) {
      throw new AppError(
        "FORBIDDEN",
        "Vous ne pouvez pas vous inviter vous-même.",
        403,
      );
    }

    // De-duplicate child ids while preserving caller order.
    const childIds = Array.from(new Set(parsed.data.childIds));

    // Owner check on every child before any DB mutation. A single non-owned
    // child id aborts the whole batch — clearer than partial success.
    for (const childId of childIds) {
      await assertChildOwner(currentUser.id, childId);
    }

    // Find children already shared with this email — these become no-ops.
    const existingMembers = await db
      .select({ childId: childAccess.childId })
      .from(childAccess)
      .innerJoin(userTable, eq(userTable.id, childAccess.userId))
      .where(eq(userTable.email, invitedEmail));
    const alreadyMemberChildIds = new Set(
      existingMembers.map((r) => r.childId),
    );

    const toInvite = childIds.filter(
      (id) => !alreadyMemberChildIds.has(id),
    );

    // Load names for the email body and the response payload.
    const childRows = childIds.length
      ? await db
          .select({ id: children.id, name: children.name })
          .from(children)
          .where(inArray(children.id, childIds))
      : [];
    const nameById = new Map(childRows.map((r) => [r.id, r.name]));

    if (toInvite.length === 0) {
      return c.json({
        ok: true,
        alreadyMemberChildIds: Array.from(alreadyMemberChildIds),
        invitedChildIds: [],
      });
    }

    const batchId = crypto.randomUUID();
    // Primary token: this is the only token included in the email.
    const primaryToken = randomBytes(TOKEN_BYTES).toString("hex");
    const primaryTokenHash = hashToken(primaryToken);
    const expiresAt = new Date(
      Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60_000,
    );

    await db.transaction(async (tx) => {
      // Clear any stale pending invites for these (child, email) pairs so the
      // partial unique index doesn't reject the insert and so the new batch
      // is the only live invitation surface.
      await tx
        .delete(childInvitations)
        .where(
          and(
            inArray(childInvitations.childId, toInvite),
            eq(childInvitations.invitedEmail, invitedEmail),
            isNull(childInvitations.acceptedAt),
          ),
        );

      for (let i = 0; i < toInvite.length; i += 1) {
        const childId = toInvite[i]!;
        // First row uses the email-bearing token; siblings get unique placeholder
        // hashes to satisfy the column's UNIQUE constraint without being usable
        // as accept tokens (the URL only carries the primary).
        const rowTokenHash =
          i === 0
            ? primaryTokenHash
            : hashToken(`${batchId}:${childId}:${randomBytes(16).toString("hex")}`);

        await tx.insert(childInvitations).values({
          childId,
          invitedEmail,
          invitedBy: currentUser.id,
          tokenHash: rowTokenHash,
          expiresAt,
          scope: "all_current",
          batchId,
        });

        await tx.insert(consents).values({
          userId: currentUser.id,
          type: "parental_authority_attestation",
          version: PARENTAL_AUTHORITY_VERSION,
        });
      }
    });

    for (const childId of toInvite) {
      void logAudit({
        actorId: currentUser.id,
        actorName: currentUser.name ?? null,
        childId,
        entityType: "child_invitation",
        entityId: null,
        action: "create",
        summary: `Invitation groupée envoyée à ${invitedEmail}`,
      });
    }

    const acceptUrl = `${appOrigin()}/invite/${primaryToken}`;
    const inviterName = currentUser.name ?? "Un parent";
    const childrenNames = toInvite
      .map((id) => nameById.get(id))
      .filter((n): n is string => Boolean(n));

    const result = await sendEmail({
      to: invitedEmail,
      subject:
        toInvite.length === 1
          ? `${inviterName} vous invite à co-parenter ${childrenNames[0] ?? ""} sur Tokō`
          : `${inviterName} vous invite à co-parenter ${toInvite.length} enfants sur Tokō`,
      html: buildBulkInviteEmail({
        inviterName,
        childrenNames,
        acceptUrl,
        expiresAt,
      }),
    });

    if (!result.sent) {
      throw new AppError(
        "INTERNAL",
        result.reason === "no-api-key"
          ? "Service email non configuré"
          : `Erreur d'envoi: ${result.detail ?? "inconnue"}`,
        500,
      );
    }

    return c.json({
      ok: true,
      batchId,
      invitedChildIds: toInvite,
      alreadyMemberChildIds: Array.from(alreadyMemberChildIds),
    });
  },
);

// Send an invite. Body: { childId, email }. Owner-only — co-parents can't
// invite further co-parents (keeps the trust chain anchored on the owner).
childInvitationsRoutes.post(
  "/",
  authMiddleware,
  inviteRateLimiter,
  async (c) => {
    const currentUser = c.get("user");
    const body = await c.req.json().catch(() => ({}));

    const childId = typeof body?.childId === "string" ? body.childId : "";
    const parsed = inviteSchema.safeParse({
      email: body?.email,
      parentalAuthorityAttestation: body?.parentalAuthorityAttestation,
    });
    if (!parsed.success || !childId) {
      return c.json(
        { error: "Données invalides", details: parsed.error?.flatten() },
        422,
      );
    }
    const invitedEmail = parsed.data.email.trim().toLowerCase();

    if (invitedEmail === currentUser.email.toLowerCase()) {
      throw new AppError(
        "FORBIDDEN",
        "Vous ne pouvez pas vous inviter vous-même.",
        403,
      );
    }

    // Owner-only.
    await assertChildOwner(currentUser.id, childId);

    // Already a co-parent on this child? No-op rather than create a stale
    // pending invite the user has to chase.
    const [alreadyMember] = await db
      .select({ userId: childAccess.userId })
      .from(childAccess)
      .innerJoin(userTable, eq(userTable.id, childAccess.userId))
      .where(
        and(
          eq(childAccess.childId, childId),
          eq(userTable.email, invitedEmail),
        ),
      )
      .limit(1);
    if (alreadyMember) {
      return c.json(
        { ok: true, alreadyMember: true },
        200,
      );
    }

    // Token: opaque 32-byte random, only ever sent in the email. We store
    // sha256(token) so a DB compromise doesn't yield usable invites.
    const token = randomBytes(TOKEN_BYTES).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(
      Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60_000,
    );

    const [child] = await db
      .select({ name: children.name })
      .from(children)
      .where(eq(children.id, childId))
      .limit(1);
    if (!child) {
      throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
    }

    await db.transaction(async (tx) => {
      await tx.insert(childInvitations).values({
        childId,
        invitedEmail,
        invitedBy: currentUser.id,
        tokenHash,
        expiresAt,
      });
      // Append-only consent record: the inviter affirms parental authority
      // for this specific share. RGPD Art. 5 + Art. 9(2)(a).
      await tx.insert(consents).values({
        userId: currentUser.id,
        type: "parental_authority_attestation",
        version: PARENTAL_AUTHORITY_VERSION,
      });
    });

    void logAudit({
      actorId: currentUser.id,
      actorName: currentUser.name ?? null,
      childId,
      entityType: "child_invitation",
      entityId: null,
      action: "create",
      summary: `Invitation envoyée à ${invitedEmail}`,
    });

    const acceptUrl = `${appOrigin()}/invite/${token}`;
    const inviterName = currentUser.name ?? "Un parent";

    const result = await sendEmail({
      to: invitedEmail,
      subject: `${inviterName} vous invite à co-parenter ${child.name} sur Tokō`,
      html: buildInviteEmail({
        inviterName,
        childName: child.name,
        acceptUrl,
        expiresAt,
      }),
    });

    if (!result.sent) {
      throw new AppError(
        "INTERNAL",
        result.reason === "no-api-key"
          ? "Service email non configuré"
          : `Erreur d'envoi: ${result.detail ?? "inconnue"}`,
        500,
      );
    }

    return c.json({ ok: true });
  },
);

// Accept the invitation. Requires the invitee to be authenticated AND for
// their authenticated email to match the address the invite was sent to —
// stops a leaked-token scenario from granting access to the wrong account.
//
// When the resolved invite carries a batch_id, every sibling row in the
// same batch is accepted in the same transaction. One co_parent_health_processing
// consent is recorded per child (DPO requirement: RGPD Art. 9(2)(a) consent
// must be specific to each minor data subject).
childInvitationsRoutes.post(
  "/:token/accept",
  authMiddleware,
  acceptRateLimiter,
  async (c) => {
    const currentUser = c.get("user");
    const token = c.req.param("token");
    const parsed = acceptInviteParamsSchema.safeParse({ token });
    if (!parsed.success) {
      throw new AppError("NOT_FOUND", "Invitation introuvable", 404);
    }
    const tokenHash = hashToken(parsed.data.token);

    const [invite] = await db
      .select()
      .from(childInvitations)
      .where(eq(childInvitations.tokenHash, tokenHash))
      .limit(1);

    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      throw new AppError("NOT_FOUND", "Invitation introuvable ou expirée", 404);
    }

    if (
      invite.invitedEmail.toLowerCase() !== currentUser.email.toLowerCase()
    ) {
      // Deliberately a 404 rather than 403 — the auth user has no business
      // knowing whether this token belongs to a specific email.
      throw new AppError("NOT_FOUND", "Invitation introuvable", 404);
    }

    // Better Auth lets a user register an email without verifying it. Without
    // this guard, an attacker who knows the invitee's address could sign up
    // with that address (unverified) and accept. Block until verified.
    //
    // Read the flag straight from the DB rather than trusting the session:
    // Better Auth's 5-minute session cookie cache can still report a stale
    // `emailVerified: false` for a few minutes right after the invitee
    // confirmed their address — which is exactly the "j'ai vérifié et j'ai
    // quand même l'erreur" report this guard used to produce.
    const [account] = await db
      .select({ emailVerified: userTable.emailVerified })
      .from(userTable)
      .where(eq(userTable.id, currentUser.id))
      .limit(1);

    if (!account?.emailVerified) {
      throw new AppError(
        "FORBIDDEN",
        "Veuillez vérifier votre adresse e-mail avant d'accepter l'invitation.",
        403,
      );
    }

    // Resolve the set of invitations to accept: either the single row keyed
    // by token, or every pending sibling in the same batch.
    const siblings = invite.batchId
      ? await db
          .select()
          .from(childInvitations)
          .where(
            and(
              eq(childInvitations.batchId, invite.batchId),
              isNull(childInvitations.acceptedAt),
              gt(childInvitations.expiresAt, new Date()),
              eq(childInvitations.invitedEmail, invite.invitedEmail),
            ),
          )
      : [invite];

    const acceptedChildIds: string[] = [];

    await db.transaction(async (tx) => {
      for (const inv of siblings) {
        await tx
          .insert(childAccess)
          .values({
            childId: inv.childId,
            userId: currentUser.id,
            role: "co_parent",
            grantedBy: inv.invitedBy,
          })
          .onConflictDoNothing({
            target: [childAccess.childId, childAccess.userId],
          });
        await tx
          .update(childInvitations)
          .set({ acceptedAt: new Date() })
          .where(eq(childInvitations.id, inv.id));
        // Per DPO requirement: ONE consent row per (child × user × purpose).
        // No aggregated/implicit consents even for a bulk acceptance.
        await tx.insert(consents).values({
          userId: currentUser.id,
          type: "co_parent_health_processing",
          version: COPARENT_HEALTH_VERSION,
        });
        acceptedChildIds.push(inv.childId);
      }
    });

    for (const childId of acceptedChildIds) {
      void logAudit({
        actorId: currentUser.id,
        actorName: currentUser.name ?? null,
        childId,
        entityType: "child_access",
        entityId: null,
        action: "accept",
        summary: `${currentUser.name ?? "Un parent"} a accepté l'invitation`,
      });

      // Notify the inviter so they know the link landed and the carnet is now
      // shared. Fire-and-forget — a failed Resend call must not roll back the
      // accept itself.
      void notifyInviterOfAcceptance({
        inviterId: invite.invitedBy,
        childId,
        acceptorName: currentUser.name ?? null,
        acceptorEmail: currentUser.email,
      });
    }

    return c.json({
      ok: true,
      childId: acceptedChildIds[0],
      childIds: acceptedChildIds,
    });
  },
);

async function notifyInviterOfAcceptance({
  inviterId,
  childId,
  acceptorName,
  acceptorEmail,
}: {
  inviterId: string;
  childId: string;
  acceptorName: string | null;
  acceptorEmail: string;
}): Promise<void> {
  try {
    const [row] = await db
      .select({
        inviterEmail: userTable.email,
        inviterName: userTable.name,
        childName: children.name,
      })
      .from(userTable)
      .innerJoin(children, eq(children.id, childId))
      .where(eq(userTable.id, inviterId))
      .limit(1);
    if (!row?.inviterEmail) return;

    const acceptorLabel = acceptorName?.trim() || acceptorEmail;
    await sendEmail({
      to: row.inviterEmail,
      subject: `${acceptorLabel} a rejoint le carnet de ${row.childName}`,
      html: buildAcceptanceEmail({
        inviterName: row.inviterName ?? "",
        acceptorLabel,
        childName: row.childName,
        appUrl: appOrigin(),
      }),
    });
  } catch (err) {
    console.error("co_parent_accept_notify_failed", err);
  }
}

