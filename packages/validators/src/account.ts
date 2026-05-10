import { z } from "zod";

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});

export type DeleteAccount = z.infer<typeof deleteAccountSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export type ResetPassword = z.infer<typeof resetPasswordSchema>;
