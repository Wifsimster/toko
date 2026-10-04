import { describe, it, expect, vi } from "vitest";
import {
  createSessionCache,
  SessionUnavailableError,
  type SessionFetchResult,
} from "../session-cache";

const SESSION = { user: { id: "u1", email: "demo@toko.app" } };

function setup(...answers: Array<SessionFetchResult | Error>) {
  let t = 0;
  const fetchSession = vi.fn(async () => {
    const next = answers.length > 1 ? answers.shift()! : answers[0]!;
    if (next instanceof Error) throw next;
    return next;
  });
  const sleep = vi.fn(async (ms: number) => {
    t += ms;
  });
  const cache = createSessionCache(fetchSession, { now: () => t, sleep });
  return { cache, fetchSession, sleep, advance: (ms: number) => (t += ms) };
}

describe("createSessionCache", () => {
  it("returns the session and caches it for 5 seconds", async () => {
    const { cache, fetchSession, advance } = setup({ ok: true, data: SESSION });
    expect(await cache.get()).toBe(SESSION);
    advance(4_000);
    expect(await cache.get()).toBe(SESSION);
    expect(fetchSession).toHaveBeenCalledTimes(1);
    advance(2_000);
    await cache.get();
    expect(fetchSession).toHaveBeenCalledTimes(2);
  });

  it("returns null when the server answers that there is no session", async () => {
    const { cache } = setup({ ok: true, data: null });
    expect(await cache.get()).toBeNull();
  });

  it("treats a 401 as signed out", async () => {
    const { cache, fetchSession } = setup({ ok: false, status: 401 });
    expect(await cache.get()).toBeNull();
    expect(fetchSession).toHaveBeenCalledTimes(1);
  });

  it("retries a 429 with backoff and returns the session once it recovers", async () => {
    const { cache, fetchSession, sleep } = setup(
      { ok: false, status: 429 },
      { ok: false, status: 429 },
      { ok: true, data: SESSION },
    );
    expect(await cache.get()).toBe(SESSION);
    expect(fetchSession).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([500, 1_000]);
  });

  it("throws SessionUnavailableError, never null, when every retry fails", async () => {
    const { cache, fetchSession } = setup({ ok: false, status: 429 });
    const err = await cache.get().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(SessionUnavailableError);
    expect((err as SessionUnavailableError).status).toBe(429);
    expect(fetchSession).toHaveBeenCalledTimes(4);
  });

  it("treats a network failure like a 429", async () => {
    const { cache } = setup(new TypeError("Failed to fetch"));
    await expect(cache.get()).rejects.toBeInstanceOf(SessionUnavailableError);
  });

  it("keeps the last good session on a 429 and does not cache the failure", async () => {
    const { cache, fetchSession, sleep, advance } = setup(
      { ok: true, data: SESSION },
      { ok: false, status: 429 },
      { ok: true, data: SESSION },
    );
    await cache.get();
    advance(6_000);
    expect(await cache.get()).toBe(SESSION);
    expect(sleep).not.toHaveBeenCalled();
    // Nothing was cached on failure: the next navigation asks the server again.
    await cache.get();
    expect(fetchSession).toHaveBeenCalledTimes(3);
  });

  it("drops the last good session after a real sign-out answer", async () => {
    const { cache, advance } = setup(
      { ok: true, data: SESSION },
      { ok: true, data: null },
      { ok: false, status: 503 },
    );
    await cache.get();
    advance(6_000);
    expect(await cache.get()).toBeNull();
    advance(6_000);
    await expect(cache.get()).rejects.toBeInstanceOf(SessionUnavailableError);
  });

  it("shares one request between concurrent callers", async () => {
    const { cache, fetchSession } = setup({ ok: true, data: SESSION });
    const [a, b] = await Promise.all([cache.get(), cache.get()]);
    expect(a).toBe(SESSION);
    expect(b).toBe(SESSION);
    expect(fetchSession).toHaveBeenCalledTimes(1);
  });

  it("invalidate forces a new request", async () => {
    const { cache, fetchSession } = setup({ ok: true, data: SESSION });
    await cache.get();
    cache.invalidate();
    await cache.get();
    expect(fetchSession).toHaveBeenCalledTimes(2);
  });
});
