export const SETTLE_MS = 120;
export const WATCHDOG_MS = 1500;

export type ScrollTracker = {
  begin: (owner: object) => void;
  touch: (owner: object) => void;
  dragEnd: (owner: object) => void;
  end: (owner: object) => void;
  release: (owner: object) => void;
  isScrolling: () => boolean;
};

export function createScrollTracker(onChange: (scrolling: boolean) => void): ScrollTracker {
  const timers = new Map<object, ReturnType<typeof setTimeout>>();
  let current = false;

  const sync = () => {
    const next = timers.size > 0;
    if (next === current) return;
    current = next;
    onChange(next);
  };

  const arm = (owner: object, ms: number) => {
    const existing = timers.get(owner);
    if (existing !== undefined) clearTimeout(existing);
    timers.set(
      owner,
      setTimeout(() => release(owner), ms),
    );
    sync();
  };

  const release = (owner: object) => {
    const existing = timers.get(owner);
    if (existing !== undefined) clearTimeout(existing);
    timers.delete(owner);
    sync();
  };

  return {
    begin: (owner) => arm(owner, WATCHDOG_MS),
    touch: (owner) => {
      if (timers.has(owner)) arm(owner, WATCHDOG_MS);
    },
    dragEnd: (owner) => arm(owner, SETTLE_MS),
    end: release,
    release,
    isScrolling: () => current,
  };
}
