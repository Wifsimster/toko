import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { createSessionCache } from "./session-cache";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "",
  sessionOptions: {
    refetchInterval: 0,
    refetchOnWindowFocus: true,
  },
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.assign("/2fa");
      },
    }),
    passkeyClient(),
  ],
}) as ReturnType<typeof createAuthClient>;

export const { useSession, signIn, signUp, signOut } = authClient;

type ResetPasswordResult = {
  error?: { message?: string; status?: number; code?: string } | null;
};
export const forgetPassword = (args: { email: string; redirectTo?: string }) =>
  (authClient as unknown as {
    forgetPassword: (a: typeof args) => Promise<ResetPasswordResult>;
  }).forgetPassword(args);

export const resetPassword = (args: { newPassword: string; token: string }) =>
  (authClient as unknown as {
    resetPassword: (a: typeof args) => Promise<ResetPasswordResult>;
  }).resetPassword(args);

export const sendVerificationEmail = (args: {
  email: string;
  callbackURL?: string;
}) =>
  (authClient as unknown as {
    sendVerificationEmail: (a: typeof args) => Promise<ResetPasswordResult>;
  }).sendVerificationEmail(args);

export async function refreshSession(): Promise<void> {
  invalidateSessionCache();
  await (authClient as unknown as {
    getSession: (opts: {
      query: { disableCookieCache: boolean };
    }) => Promise<unknown>;
  }).getSession({ query: { disableCookieCache: true } });
}

const sessionCache = createSessionCache(async () => {
  const res = (await authClient.getSession()) as {
    data: unknown;
    error?: { status?: number } | null;
  };
  return res.error ? { ok: false, status: res.error.status } : { ok: true, data: res.data };
});

export function getCachedSession() {
  return sessionCache.get();
}

export function invalidateSessionCache() {
  sessionCache.invalidate();
}
