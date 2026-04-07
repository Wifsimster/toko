import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "",
  sessionOptions: {
    refetchInterval: 0,
    refetchOnWindowFocus: true,
  },
}) as ReturnType<typeof createAuthClient>;

export const { useSession, signIn, signUp, signOut } = authClient;

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
