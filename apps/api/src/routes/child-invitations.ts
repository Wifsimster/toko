import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
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
  acceptInviteParamsSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { rateLimiter } from "../middleware/rate-limiter";
import { AppError } from "../middleware/error-handler";
import { assertChildOwner } from "../lib/child-access";
import { logAudit } from "../lib/audit";
import { sendEmail } from "../lib/email";
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

  return c.json({
    childName: row.childName,
    inviterName: row.inviterName ?? "Un parent",
    expiresAt: row.expiresAt,
  });
});

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
    if (!currentUser.emailVerified) {
      throw new AppError(
        "FORBIDDEN",
        "Veuillez vérifier votre adresse e-mail avant d'accepter l'invitation.",
        403,
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(childAccess)
        .values({
          childId: invite.childId,
          userId: currentUser.id,
          role: "co_parent",
          grantedBy: invite.invitedBy,
        })
        .onConflictDoNothing({
          target: [childAccess.childId, childAccess.userId],
        });
      await tx
        .update(childInvitations)
        .set({ acceptedAt: new Date() })
        .where(eq(childInvitations.id, invite.id));
      // Invitee's explicit RGPD Art. 9(2)(a) consent to process the child's
      // health data. Append-only — keeps the audit trail intact across
      // revoke/re-invite cycles.
      await tx.insert(consents).values({
        userId: currentUser.id,
        type: "co_parent_health_processing",
        version: COPARENT_HEALTH_VERSION,
      });
    });

    void logAudit({
      actorId: currentUser.id,
      actorName: currentUser.name ?? null,
      childId: invite.childId,
      entityType: "child_access",
      entityId: null,
      action: "accept",
      summary: `${currentUser.name ?? "Un parent"} a accepté l'invitation`,
    });

    return c.json({ ok: true, childId: invite.childId });
  },
);

interface InviteEmailParams {
  inviterName: string;
  childName: string;
  acceptUrl: string;
  expiresAt: Date;
}

function buildInviteEmail({
  inviterName,
  childName,
  acceptUrl,
  expiresAt,
}: InviteEmailParams): string {
  const expiryFr = expiresAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const safeInviter = escapeHtml(inviterName);
  const safeChild = escapeHtml(childName);
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Invitation Tokō</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
  <div style="border-bottom:2px solid #6366f1;padding-bottom:16px;margin-bottom:24px">
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;margin:0">Tokō · invitation</p>
    <h1 style="font-size:22px;margin:8px 0 4px">${safeInviter} vous invite à co-parenter ${safeChild}</h1>
  </div>
  <p style="font-size:15px;line-height:1.6">
    Tokō est un carnet de consultation TDAH partagé. En acceptant cette invitation, vous accédez aux mêmes informations que ${safeInviter} pour ${safeChild} : symptômes, journal, traitement, programme Barkley.
  </p>
  <p style="text-align:center;margin:24px 0">
    <a href="${acceptUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Accepter l'invitation</a>
  </p>
  <p style="font-size:13px;color:#6b7280">
    Ou collez ce lien dans votre navigateur :<br>
    <a href="${acceptUrl}" style="color:#6366f1;word-break:break-all">${acceptUrl}</a>
  </p>
  <p style="font-size:12px;color:#9ca3af;margin-top:24px">
    L'invitation expire le ${expiryFr}. Si vous n'attendiez pas cet email, ignorez-le — aucun compte n'est créé sans votre action.
  </p>
</body></html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
