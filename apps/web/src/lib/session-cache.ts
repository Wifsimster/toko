// Session lookup for route guards. Only a successful get-session response says
// whether the parent is signed in: a 429, a 5xx or a network failure says
// nothing about the session, so it must never be read as "signed out".

/** Outcome of one get-session call. `status` is the HTTP status of a failure. */
export type SessionFetchResult =
  | { ok: true; data: unknown }
  | { ok: false; status?: number };

/** get-session failed for a reason that says nothing about the session. */
export class SessionUnavailableError extends Error {
  constructor(public status?: number) {
    super(
      status
        ? `Session check failed (HTTP ${status})`
        : "Session check failed (network error)",
    );
    this.name = "SessionUnavailableError";
  }
}

const CACHE_TTL_MS = 5_000;
// Waits before each retry. The 429 window is a minute, so retrying longer
// than a few seconds only delays the page.
const RETRY_DELAYS_MS = [500, 1_000, 2_000];

interface Options {
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

export function createSessionCache(
  fetchSession: () => Promise<SessionFetchResult>,
  {
    now = Date.now,
    sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  }: Options = {},
) {
  let cache: { data: unknown; ts: number } | null = null;
  let inFlight: Promise<unknown> | null = null;
  // Last signed-in answer. Served when get-session fails, never cached.
  let lastGood: unknown = null;

  async function resolve(): Promise<unknown> {
    let last: SessionFetchResult = { ok: false };
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      last = await fetchSession().catch(() => ({ ok: false }) as const);
      if (last.ok) {
        cache = { data: last.data, ts: now() };
        lastGood = last.data ?? null;
        return last.data;
      }
      // 401 is the server saying "no session": a real answer.
      if (last.status === 401) {
        cache = { data: null, ts: now() };
        lastGood = null;
        return null;
      }
      // Already signed in during this page's life: keep the parent on the
      // page now. The next navigation asks again, since nothing is cached.
      if (lastGood) return lastGood;
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay !== undefined) await sleep(delay);
    }
    throw new SessionUnavailableError(last.ok ? undefined : last.status);
  }

  return {
    get(): Promise<unknown> {
      if (cache && now() - cache.ts < CACHE_TTL_MS) {
        return Promise.resolve(cache.data);
      }
      if (inFlight) return inFlight;
      inFlight = resolve().finally(() => {
        inFlight = null;
      });
      return inFlight;
    },
    invalidate() {
      cache = null;
    },
  };
}
