import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().email("L'adresse e-mail est invalide"),
});

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
