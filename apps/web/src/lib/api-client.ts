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
    // Better Auth returns 200 with `null` body when there is no session.
    // Only redirect if the session really is gone.
    if (res.ok) {
      const body = await res.json().catch(() => null);
      if (body && body.user) {
        redirecting = false;
        return;
      }
    }
    window.location.href = "/login";
  } catch {
    // On network failure, don't sign the user out.
    redirecting = false;
  }
}

class ApiError extends Error {
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
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ code: "UNKNOWN", error: response.statusText }));
    if (response.status === 401) {
      // Avoid redirect loops on public pages (login, signup, landing, etc.)
      const path = window.location.pathname;
      const isPublic =
        path === "/" ||
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/reset-password") ||
        path.startsWith("/forgot-password");
      if (!isPublic) {
        // Confirm the session is actually gone before signing the user out.
        // A transient 401 (e.g. cookie rotation race with Better Auth) should
        // not log the user out — only redirect when the session truly is null.
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
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      ...(data !== undefined && { body: JSON.stringify(data) }),
    }),
};
