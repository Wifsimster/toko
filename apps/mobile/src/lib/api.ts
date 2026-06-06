import { getSessionCookie } from "./auth";
import { API_URL } from "./config";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const cookie = getSessionCookie();
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    };
    throw new ApiError(
      response.status,
      body.error ?? `Erreur ${response.status}`,
      body.code,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** REST client mirroring apps/web/src/lib/api-client.ts, but cookie-aware for mobile. */
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Subscription/entitlement status — drives premium unlock (no Play Billing). */
export type BillingStatus = {
  status: string;
  active: boolean;
  granted: boolean;
};

export function fetchBillingStatus() {
  return api.get<BillingStatus>("/billing/status");
}
