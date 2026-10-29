import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function newPinSalt(): string {
  return randomBytes(16).toString("hex");
}

export function hashPin(pin: string, salt: string): string {
  return createHash("sha256").update(salt + pin).digest("hex");
}

export function pinMatches(
  candidatePin: string,
  storedHash: string,
  salt: string,
): boolean {
  const a = Buffer.from(hashPin(candidatePin, salt), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
