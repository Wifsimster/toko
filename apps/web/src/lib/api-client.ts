const API_BASE = "/api";

let redirecting = false;

async function confirmAndRedirect() {
  if (redirecting) return;
  redirecting = true;
  try {
    const res = await fetch("/api/auth/get-session", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const body = res.ok ? await res.json().catch(() => undefined) : undefined;
    if (!res.ok || body === undefined || body?.user) {
      redirecting = false;
      return;
    }
    window.location.href = "/login";
  } catch {
    redirecting = false;
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && options?.body instanceof FormData;
  const headers: Record<string, string> = isFormData
    ? { ...(options?.headers as Record<string, string> | undefined) }
    : {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string> | undefined),
      };

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ code: "UNKNOWN", error: response.statusText }));
    if (response.status === 401) {
      const path = window.location.pathname;
      const isPublic =
        path === "/" ||
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/reset-password") ||
        path.startsWith("/forgot-password");
      if (!isPublic) {
        void confirmAndRedirect();
      }
    }
    throw new ApiError(
      response.status,
      body.code ?? "UNKNOWN",
      body.error ?? "Une erreur est survenue"
    );
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      ...(data !== undefined && { body: JSON.stringify(data) }),
    }),
};
