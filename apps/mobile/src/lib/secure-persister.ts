import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import aesjs from "aes-js";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

/**
 * Encrypted React Query cache persister.
 *
 * The persisted cache holds children's health data (journal, symptoms,
 * medications) — sensitive data under the GDPR. AsyncStorage is plaintext on
 * disk, so we encrypt the dehydrated client with AES-256-CTR before writing it.
 * The 256-bit key lives in `expo-secure-store` (Android Keystore-backed), the
 * same store that already holds the session cookie, so the cache is unreadable
 * without unlocking the device's keystore. A fresh random IV is generated per
 * write and prepended to the ciphertext.
 */

const CACHE_KEY = "toko-query-cache";
const SECURE_KEY_NAME = "toko-cache-key";
const IV_BYTES = 16;
const KEY_BYTES = 32; // AES-256

async function getOrCreateKey(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(SECURE_KEY_NAME);
  if (existing) return aesjs.utils.hex.toBytes(existing);
  const key = await Crypto.getRandomBytesAsync(KEY_BYTES);
  await SecureStore.setItemAsync(SECURE_KEY_NAME, aesjs.utils.hex.fromBytes(key));
  return key;
}

// Resolve the key once and reuse the promise for every read/write.
let keyPromise: Promise<Uint8Array> | null = null;
function cacheKey(): Promise<Uint8Array> {
  return (keyPromise ??= getOrCreateKey());
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await cacheKey();
  const iv = await Crypto.getRandomBytesAsync(IV_BYTES);
  const ctr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(iv));
  const ciphertext = ctr.encrypt(aesjs.utils.utf8.toBytes(plaintext));
  return `${aesjs.utils.hex.fromBytes(iv)}:${aesjs.utils.hex.fromBytes(ciphertext)}`;
}

async function decrypt(payload: string): Promise<string> {
  const [ivHex, dataHex] = payload.split(":");
  if (!ivHex || !dataHex) throw new Error("malformed cache payload");
  const key = await cacheKey();
  const ctr = new aesjs.ModeOfOperation.ctr(
    key,
    new aesjs.Counter(aesjs.utils.hex.toBytes(ivHex)),
  );
  return aesjs.utils.utf8.fromBytes(ctr.decrypt(aesjs.utils.hex.toBytes(dataHex)));
}

// Trailing throttle so frequent cache updates don't trigger an encrypt+write on
// every change — mirrors createAsyncStoragePersister's throttleTime.
function throttle(fn: () => void, waitMs: number): () => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    const run = () => {
      last = Date.now();
      timer = null;
      fn();
    };
    if (timer) return;
    const elapsed = Date.now() - last;
    if (elapsed >= waitMs) run();
    else timer = setTimeout(run, waitMs - elapsed);
  };
}

/** Encrypted drop-in replacement for createAsyncStoragePersister. */
export function createSecurePersister(): Persister {
  let pending: PersistedClient | null = null;
  const flush = throttle(() => {
    const client = pending;
    if (!client) return;
    pending = null;
    void encrypt(JSON.stringify(client))
      .then((enc) => AsyncStorage.setItem(CACHE_KEY, enc))
      .catch(() => undefined); // best-effort; never crash on persist
  }, 1000);

  return {
    persistClient(client) {
      pending = client;
      flush();
    },
    async restoreClient() {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (!raw) return undefined;
        return JSON.parse(await decrypt(raw)) as PersistedClient;
      } catch {
        // Corrupt cache, a rotated key, or a legacy plaintext cache from an
        // older build — discard it and start fresh rather than failing.
        await AsyncStorage.removeItem(CACHE_KEY).catch(() => undefined);
        return undefined;
      }
    },
    async removeClient() {
      await AsyncStorage.removeItem(CACHE_KEY).catch(() => undefined);
    },
  };
}
