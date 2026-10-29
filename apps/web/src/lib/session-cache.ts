export type SessionFetchResult =
  | { ok: true; data: unknown }
  | { ok: false; status?: number };

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
      if (last.status === 401) {
        cache = { data: null, ts: now() };
        lastGood = null;
        return null;
      }
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
