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
      // Fires when sign-in succeeds but the account has 2FA enabled —
      // Better Auth holds the partial session in a short-lived cookie
      // and expects us to land on a dedicated challenge screen.
      onTwoFactorRedirect() {
        window.location.assign("/2fa");
      },
    }),
    passkeyClient(),
  ],
}) as ReturnType<typeof createAuthClient>;

export const { useSession, signIn, signUp, signOut } = authClient;

// Better Auth's React client exposes these helpers when emailAndPassword is
// enabled on the server, but `ReturnType<typeof createAuthClient>` collapses
// the generic so they don't surface on the cast type. Re-export through a
// loose-typed wrapper.
type ResetPasswordResult = { error?: { message?: string } | null };
export const forgetPassword = (args: { email: string; redirectTo?: string }) =>
  (authClient as unknown as {
    forgetPassword: (a: typeof args) => Promise<ResetPasswordResult>;
  }).forgetPassword(args);

export const resetPassword = (args: { newPassword: string; token: string }) =>
  (authClient as unknown as {
    resetPassword: (a: typeof args) => Promise<ResetPasswordResult>;
  }).resetPassword(args);

// (Re)send the email-verification link. `callbackURL` is where the invitee
// lands after clicking the link — pass the invitation page so they return
// straight to it, already verified.
export const sendVerificationEmail = (args: {
  email: string;
  callbackURL?: string;
}) =>
  (authClient as unknown as {
    sendVerificationEmail: (a: typeof args) => Promise<ResetPasswordResult>;
  }).sendVerificationEmail(args);

// Forces a DB-backed session read, bypassing Better Auth's signed-cookie
// cache (5-minute TTL). Used right after email verification so a stale
// `emailVerified: false` doesn't linger until the cache expires.
export async function refreshSession(): Promise<void> {
  invalidateSessionCache();
  await (authClient as unknown as {
    getSession: (opts: {
      query: { disableCookieCache: boolean };
    }) => Promise<unknown>;
  }).getSession({ query: { disableCookieCache: true } });
}

// Route guards call this on every navigation (beforeLoad). Answers are cached
// for 5 seconds; a failed check (429, 5xx, network) is retried and never
// reported as signed out (see session-cache.ts).
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
