import { useMemo } from "react";
import { makeMutable } from "react-native-reanimated";

export const scrollActivity = makeMutable(false);

let scrolling = false;
let settleTimer: ReturnType<typeof setTimeout> | undefined;

const SETTLE_MS = 120;

function set(next: boolean) {
  if (scrolling === next) return;
  scrolling = next;
  scrollActivity.value = next;
}

function clearSettle() {
  if (settleTimer !== undefined) {
    clearTimeout(settleTimer);
    settleTimer = undefined;
  }
}

export function isScrolling(): boolean {
  return scrolling;
}

export function useScrollActivityHandlers() {
  return useMemo(
    () => ({
      onScrollBeginDrag: () => {
        clearSettle();
        set(true);
      },
      onScrollEndDrag: () => {
        clearSettle();
        settleTimer = setTimeout(() => set(false), SETTLE_MS);
      },
      onMomentumScrollBegin: () => {
        clearSettle();
        set(true);
      },
      onMomentumScrollEnd: () => {
        clearSettle();
        set(false);
      },
    }),
    [],
  );
}
