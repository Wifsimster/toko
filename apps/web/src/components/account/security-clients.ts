import { authClient } from "@/lib/auth-client";

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
