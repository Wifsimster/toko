import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().email("L'adresse e-mail est invalide"),
  // RGPD Art. 9(2)(a) + Art. 371-1 C. civ.: the inviter must affirm they
  // hold parental authority over the child before sharing health data.
  parentalAuthorityAttestation: z.literal(true, {
    errorMap: () => ({
      message:
        "Vous devez confirmer détenir l'autorité parentale pour inviter un co-parent.",
    }),
  }),
});

export const bulkInviteSchema = z.object({
  email: z.string().email("L'adresse e-mail est invalide"),
  childIds: z.array(z.string().min(1)).min(1, "Au moins un enfant requis").max(20, "Trop d'enfants"),
  parentalAuthorityAttestation: z.literal(true, {
    errorMap: () => ({
      message: "Vous devez confirmer détenir l'autorité parentale pour inviter un co-parent.",
    }),
  }),
});
export type BulkInvite = z.infer<typeof bulkInviteSchema>;

export const acceptInviteParamsSchema = z.object({
  token: z.string().min(20, "Le jeton d'invitation est invalide"),
});

export const childInvitationSchema = z.object({
  id: z.string().uuid(),
  childId: z.string(),
  invitedEmail: z.string().email(),
  invitedBy: z.string(),
  tokenHash: z.string(),
  expiresAt: z.string().datetime(),
  acceptedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type Invite = z.infer<typeof inviteSchema>;
export type AcceptInviteParams = z.infer<typeof acceptInviteParamsSchema>;
export type ChildInvitation = z.infer<typeof childInvitationSchema>;
