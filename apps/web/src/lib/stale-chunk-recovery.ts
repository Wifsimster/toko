const RELOAD_FLAG = "toko:stale-chunk-reloaded";

const CHUNK_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i;

function isChunkError(reason: unknown): boolean {
  const message =
    reason instanceof Error ? reason.message : typeof reason === "string" ? reason : "";
  return CHUNK_ERROR.test(message);
}

async function purgeAndReload(): Promise<void> {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return;
    sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    return;
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    const registrations =
      "serviceWorker" in navigator
        ? await navigator.serviceWorker.getRegistrations()
        : [];
    await Promise.all(registrations.map((r) => r.unregister()));
  } catch {
  }

  window.location.reload();
}

export function recoverFromStaleChunks(): void {
  window.addEventListener("unhandledrejection", (event) => {
    if (isChunkError(event.reason)) {
      event.preventDefault();
      void purgeAndReload();
    }
  });

  window.addEventListener("error", (event) => {
    if (isChunkError(event.message) || isChunkError(event.error)) {
      void purgeAndReload();
    }
  });

  window.addEventListener("load", () => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
    }
  });
}
