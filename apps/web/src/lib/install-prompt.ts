export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Chrome fires `beforeinstallprompt` once, very early in page load — often
// before React has mounted the route tree. Capturing it here, at module
// evaluation time, ensures the event is stashed instead of lost.
let deferredEvent: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredEvent = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredEvent = null;
    emit();
  });
}

export function getDeferredInstallEvent() {
  return deferredEvent;
}

export function consumeDeferredInstallEvent() {
  deferredEvent = null;
  emit();
}

export function wasAppInstalled() {
  return installed;
}

export function subscribeInstallState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
