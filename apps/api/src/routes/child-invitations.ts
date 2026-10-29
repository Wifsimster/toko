import { Hono } from "hono";
import { randomBytes } from "node:crypto";
import { and, eq, gt, inArray, isNull } from "drizzle-orm";
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
import { withLiveSession } from "../lib/live-session";
import { assertChildOwner } from "../lib/child-access";
import { logAudit } from "../lib/audit";
import { sendEmail } from "../lib/email";
import {
  buildInviteEmail,
  buildBulkInviteEmail,
} from "../lib/co-parent-emails";
import type { AppEnv } from "../types";
import {
  appOrigin,
  COPARENT_HEALTH_VERSION,
  hashToken,
  inviteExpiry,
  newInviteToken,
  PARENTAL_AUTHORITY_VERSION,
} from "../lib/child-invitations/tokens";
import { notifyInviterOfAcceptance } from "../lib/child-invitations/notify";
import { parseBody } from "../lib/http/validate";
import { z } from "zod";

const inviteBodySchema = inviteSchema.extend({
  childId: z.string().min(1),
});

export const childInvitationsRoutes = new Hono<AppEnv>();

const inviteRateLimiter = rateLimiter({
  namespace: "child-invitations-create",
  windowMs: 60 * 60_000,
  limit: 5,
  keyBy: "user",
});

const acceptRateLimiter = rateLimiter({
  namespace: "child-invitations-accept",
  windowMs: 60_000,
  limit: 10,
});

const tokenLookupRateLimiter = rateLimiter({
  namespace: "child-invitations-lookup",
  windowMs: 60_000,
  limit: 30,
});

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

  if (pendingChildren.length === 0) {
    throw new AppError("NOT_FOUND", "Invitation introuvable ou expirée", 404);
  }

  return c.json({
    inviterName: row.inviterName ?? "Un parent",
    expiresAt: row.expiresAt,
    children: pendingChildren,
    childName: pendingChildren[0]?.name ?? row.childName,
  });
});

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

childInvitationsRoutes.post(
  "/bulk",
  authMiddleware,
  inviteRateLimiter,
  async (c) => {
    const currentUser = c.get("user");
    const input = await parseBody(c, bulkInviteSchema);

    const invitedEmail = input.email.trim().toLowerCase();
    if (invitedEmail === currentUser.email.toLowerCase()) {
      throw new AppError(
        "FORBIDDEN",
        "Vous ne pouvez pas vous inviter vous-même.",
        403,
      );
    }

    const childIds = Array.from(new Set(input.childIds));

    for (const childId of childIds) {
      await assertChildOwner(currentUser.id, childId);
    }

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
    const primaryToken = newInviteToken();
    const primaryTokenHash = hashToken(primaryToken);
    const expiresAt = inviteExpiry();

    await withLiveSession(c, async (tx) => {
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

childInvitationsRoutes.post(
  "/",
  authMiddleware,
  inviteRateLimiter,
  async (c) => {
    const currentUser = c.get("user");
    const { childId, ...input } = await parseBody(
      c,
      inviteBodySchema,
    );
    const invitedEmail = input.email.trim().toLowerCase();

    if (invitedEmail === currentUser.email.toLowerCase()) {
      throw new AppError(
        "FORBIDDEN",
        "Vous ne pouvez pas vous inviter vous-même.",
        403,
      );
    }

    await assertChildOwner(currentUser.id, childId);

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

    const token = newInviteToken();
    const tokenHash = hashToken(token);
    const expiresAt = inviteExpiry();

    const [child] = await db
      .select({ name: children.name })
      .from(children)
      .where(eq(children.id, childId))
      .limit(1);
    if (!child) {
      throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
    }

    await withLiveSession(c, async (tx) => {
      await tx
        .delete(childInvitations)
        .where(
          and(
            eq(childInvitations.childId, childId),
            eq(childInvitations.invitedEmail, invitedEmail),
            isNull(childInvitations.acceptedAt),
          ),
        );
      await tx.insert(childInvitations).values({
        childId,
        invitedEmail,
        invitedBy: currentUser.id,
        tokenHash,
        expiresAt,
      });
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
      throw new AppError("NOT_FOUND", "Invitation introuvable", 404);
    }

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
        const [inviterOwns] = await tx
          .select({ id: childAccess.id })
          .from(childAccess)
          .where(
            and(
              eq(childAccess.childId, inv.childId),
              eq(childAccess.userId, inv.invitedBy),
              eq(childAccess.role, "owner"),
            ),
          )
          .limit(1);
        if (!inviterOwns) continue;

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
        await tx.insert(consents).values({
          userId: currentUser.id,
          type: "co_parent_health_processing",
          version: COPARENT_HEALTH_VERSION,
        });
        acceptedChildIds.push(inv.childId);
      }

      if (acceptedChildIds.length === 0) {
        throw new AppError(
          "INVITER_NOT_OWNER",
          "Cette invitation n'est plus valable : la personne qui l'a envoyée ne gère plus cet enfant. Demandez-lui une nouvelle invitation.",
          403,
        );
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
