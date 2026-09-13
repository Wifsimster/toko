import { createHash, randomBytes } from "node:crypto";
import { env } from "../env";

/**
 * Invitation tokens and the constants that pin them.
 *
 * Only the hash is stored: a leaked database row cannot be replayed as an
 * invitation. Kept out of the route for the same reason as the app-lock
 * PIN — cryptography is not an HTTP concern, and a private function inside
 * a 700-line router cannot be tested without one.
 */

export const INVITE_TTL_DAYS = 14;

// 256 bits — matches Better Auth's verification token strength.
const TOKEN_BYTES = 32;

// Bumped whenever the inviter-facing attestation copy changes — pins the
// consent row to the exact wording the user agreed to.
export const PARENTAL_AUTHORITY_VERSION = "2026-05-09";
// Same idea on the invitee side (Art. 9(2)(a) RGPD consent text).
export const COPARENT_HEALTH_VERSION = "2026-05-09";

/** A fresh bearer token. Handed to the invitee once; never stored as-is. */
export function newInviteToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** When an invitation minted `from` stops being accepted. */
export function inviteExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function appOrigin(): string {
  return env.CORS_ORIGIN || "http://localhost:5173";
}
