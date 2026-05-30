import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

// Business rule E5: auto-lock the parent screen after 5 minutes of inactivity.
// Listens to pointer, keyboard and touch events; resets a rolling timer on each.
// `delayMs` is overridable for tests.
const DEFAULT_DELAY_MS = 5 * 60 * 1000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
] as const;

export function useIdleLock(delayMs = DEFAULT_DELAY_MS) {
  const lock = useUiStore((s) => s.lock);
  const isLocked = useUiStore((s) => s.isLocked);

  useEffect(() => {
    if (isLocked) return;

    let timerId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      clearTimeout(timerId);
      timerId = setTimeout(lock, delayMs);
    };

    schedule();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, schedule, { passive: true });
    }

    return () => {
      clearTimeout(timerId);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, schedule);
      }
    };
  }, [isLocked, lock, delayMs]);
}
