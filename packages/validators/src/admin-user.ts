import { z } from "zod";

export const updateUserRoleSchema = z.object({
  isAdmin: z.boolean(),
});

export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;
