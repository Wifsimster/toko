import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * App-lock PIN hashing (business rule E4).
 *
 * Lives outside the route because cryptography is not an HTTP concern and
 * because a private function inside a 700-line router could only be tested
 * by re-implementing it in the test file — which is exactly what
 * `__tests__/lock-pin.test.ts` used to do, leaving the real code
 * uncovered.
 */

export function newPinSalt(): string {
  return randomBytes(16).toString("hex");
}

export function hashPin(pin: string, salt: string): string {
  return createHash("sha256").update(salt + pin).digest("hex");
}

/** Constant-time comparison — never compare the hex strings directly. */
export function pinMatches(
  candidatePin: string,
  storedHash: string,
  salt: string,
): boolean {
  const a = Buffer.from(hashPin(candidatePin, salt), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
