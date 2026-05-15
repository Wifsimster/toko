import { z } from "zod";

// Input for creating an agent access key. The parent only supplies a label
// and an optional expiry; the secret is generated server-side.
export const createAgentKeySchema = z.object({
  name: z.string().trim().min(1).max(60),
  // Optional self-imposed expiry. Capped at one year so a forgotten key
  // cannot live indefinitely. Omitted → no expiry (revoke-only).
  expiresInDays: z.number().int().positive().max(365).optional(),
});

// Shape returned to the management UI — never includes the hash or secret.
export const agentKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  scopes: z.string(),
  lastUsedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type CreateAgentKey = z.infer<typeof createAgentKeySchema>;
export type AgentKey = z.infer<typeof agentKeySchema>;
