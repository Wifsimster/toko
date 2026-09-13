import { authClient } from "@/lib/auth-client";

/**
 * Typed accessors for the Better Auth plugins.
 *
 * The React client exposes twoFactor/passkey at runtime, but the
 * generic-stripped client type does not declare them. Casting through
 * these narrow interfaces gives the SPA type help without re-importing the
 * whole plugin generic — and keeps the cast in one place rather than in
 * each component that calls a plugin.
 */

export type TwoFactorEnableResult = {
  data?: { totpURI?: string; backupCodes?: string[] } | null;
  error?: { message?: string } | null;
};
export type Passkey = {
  id: string;
  name?: string | null;
  createdAt?: string | Date | null;
  deviceType?: string;
};

export const tfClient = () =>
  (authClient as unknown as {
    twoFactor: {
      enable: (a: { password: string }) => Promise<TwoFactorEnableResult>;
      disable: (a: { password: string }) => Promise<TwoFactorEnableResult>;
      getTotpUri: (a: {
        password: string;
      }) => Promise<{ data?: { totpURI?: string } | null; error?: unknown }>;
      generateBackupCodes: (a: { password: string }) => Promise<{
        data?: { backupCodes?: string[] } | null;
        error?: unknown;
      }>;
    };
  }).twoFactor;

export const pkClient = () =>
  (authClient as unknown as {
    passkey: {
      addPasskey: (a?: {
        name?: string;
      }) => Promise<{ data?: unknown; error?: { message?: string } | null }>;
      listUserPasskeys: () => Promise<{
        data?: Passkey[] | null;
        error?: unknown;
      }>;
      deletePasskey: (a: { id: string }) => Promise<{
        data?: unknown;
        error?: { message?: string } | null;
      }>;
    };
  }).passkey;
