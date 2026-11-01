import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_PREFIX = "scrypt$";
const SCRYPT_KEY_LENGTH = 32;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 } as const;

export function newPinSalt(): string {
  return randomBytes(16).toString("hex");
}

export function hashPin(pin: string, salt: string): string {
  return createHash("sha256").update(salt + pin).digest("hex");
}

export function hashPinStrong(pin: string, salt: string): string {
  const key = scryptSync(pin, salt, SCRYPT_KEY_LENGTH, SCRYPT_OPTIONS);
  return `${SCRYPT_PREFIX}${key.toString("hex")}`;
}

export function isLegacyPinHash(storedHash: string): boolean {
  return !storedHash.startsWith(SCRYPT_PREFIX);
}

export function pinMatches(
  candidatePin: string,
  storedHash: string,
  salt: string,
): boolean {
  const candidate = isLegacyPinHash(storedHash)
    ? hashPin(candidatePin, salt)
    : hashPinStrong(candidatePin, salt);
  const strip = (h: string) =>
    h.startsWith(SCRYPT_PREFIX) ? h.slice(SCRYPT_PREFIX.length) : h;
  const a = Buffer.from(strip(candidate), "hex");
  const b = Buffer.from(strip(storedHash), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
