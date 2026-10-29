import { z } from "zod";

export const createAgentKeySchema = z.object({
  name: z.string().trim().min(1).max(60),
  expiresInDays: z.number().int().positive().max(365).optional(),
});

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
