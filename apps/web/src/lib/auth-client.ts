import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

const _authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "",
  sessionOptions: {
    refetchInterval: 0,
    refetchOnWindowFocus: true,
  },
  plugins: [passkeyClient()],
});

// Keep the existing cast so consumers that depend on the loose shape don't
// break, but preserve the passkey namespace as a typed re-export.
export const authClient = _authClient as ReturnType<typeof createAuthClient> & {
  passkey: typeof _authClient.passkey;
  signIn: typeof _authClient.signIn;
};

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

// Deduplicates getSession calls during rapid navigation (beforeLoad fires on every route change).
// Returns cached result if fetched within the last 5 seconds.
let _sessionCache: { data: unknown; ts: number } | null = null;
let _sessionInFlight: Promise<unknown> | null = null;
const SESSION_CACHE_TTL = 5_000;

export async function getCachedSession() {
  const now = Date.now();
  if (_sessionCache && now - _sessionCache.ts < SESSION_CACHE_TTL) {
    return _sessionCache.data;
  }
  if (_sessionInFlight) return _sessionInFlight;
  _sessionInFlight = authClient
    .getSession()
    .then((res: { data: unknown }) => {
      _sessionCache = { data: res.data, ts: Date.now() };
      _sessionInFlight = null;
      return res.data;
    })
    .catch((err: unknown) => {
      _sessionInFlight = null;
      throw err;
    });
  return _sessionInFlight;
}

export function invalidateSessionCache() {
  _sessionCache = null;
}
