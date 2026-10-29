import { createHash, randomBytes } from "node:crypto";
import { env } from "../env";

export const INVITE_TTL_DAYS = 14;

const TOKEN_BYTES = 32;

export const PARENTAL_AUTHORITY_VERSION = "2026-05-09";
export const COPARENT_HEALTH_VERSION = "2026-05-09";

export function newInviteToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function inviteExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function appOrigin(): string {
  return env.CORS_ORIGIN || "http://localhost:5173";
}
