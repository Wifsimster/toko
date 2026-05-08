import { z } from "zod";

export const childAccessRoleSchema = z.enum(["owner", "co_parent"]);

export const childAccessSchema = z.object({
  id: z.string().uuid(),
  childId: z.string(),
  userId: z.string(),
  role: childAccessRoleSchema,
  grantedBy: z.string().nullable(),
  grantedAt: z.string().datetime(),
});

export type ChildAccessRole = z.infer<typeof childAccessRoleSchema>;
export type ChildAccess = z.infer<typeof childAccessSchema>;
