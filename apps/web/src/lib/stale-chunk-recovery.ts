// Recovery from the "blank screen after deploy" failure mode.
//
// Every route is code-split (`autoCodeSplitting`), so a tab or an installed PWA
// that still runs a previous build asks for chunks whose content hash no longer
// exists on the server. The dynamic import then rejects and the route never
// mounts: the user gets an empty shell with no error surfaced anywhere.
//
// The only safe cure is to throw the stale build away and fetch the current
// one. We reload once — guarded by a sessionStorage flag — so that a genuine,
// reproducible chunk failure (a truly broken deploy, an offline client) cannot
// turn into a reload loop.

const RELOAD_FLAG = "toko:stale-chunk-reloaded";

// Matches the browser wording for a failed dynamic import. Chromium, Firefox
// and WebKit all phrase it differently, hence the alternatives.
const CHUNK_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i;

function isChunkError(reason: unknown): boolean {
  const message =
    reason instanceof Error ? reason.message : typeof reason === "string" ? reason : "";
  return CHUNK_ERROR.test(message);
}

async function purgeAndReload(): Promise<void> {
  // Reload at most once per tab, otherwise a chunk that fails for any other
  // reason (no network, a bad build) would reload forever.
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, "1");

  // Drop the precache first: the service worker would otherwise hand the same
  // stale shell straight back on reload.
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
    // Storage or SW APIs can be unavailable (private mode, disabled SW).
    // Reloading without the purge is still better than a blank screen.
  }

  window.location.reload();
}

export function recoverFromStaleChunks(): void {
  // Rejected dynamic import inside the router / React lazy boundaries.
  window.addEventListener("unhandledrejection", (event) => {
    if (isChunkError(event.reason)) {
      event.preventDefault();
      void purgeAndReload();
    }
  });

  // Synchronous module-evaluation failures surface here instead.
  window.addEventListener("error", (event) => {
    if (isChunkError(event.message) || isChunkError(event.error)) {
      void purgeAndReload();
    }
  });

  // A successful load means the current build works — clear the guard so a
  // future deploy can recover again in this same tab.
  window.addEventListener("load", () => {
    sessionStorage.removeItem(RELOAD_FLAG);
  });
}
