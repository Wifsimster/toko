import { useContext, useEffect, useMemo, useRef } from "react";
import { makeMutable } from "react-native-reanimated";
import { NavigationContext } from "@react-navigation/native";

import { createScrollTracker } from "./scroll-tracker";

export const scrollActivity = makeMutable(false);

const tracker = createScrollTracker((next) => {
  scrollActivity.value = next;
});

export function isScrolling(): boolean {
  return tracker.isScrolling();
}

export function useScrollActivityHandlers() {
  const owner = useRef({}).current;
  const navigation = useContext(NavigationContext);

  useEffect(() => {
    const off = navigation?.addListener("blur", () => tracker.release(owner));
    return () => {
      off?.();
      tracker.release(owner);
    };
  }, [navigation, owner]);

  return useMemo(
    () => ({
      scrollEventThrottle: 100,
      onScroll: () => tracker.touch(owner),
      onScrollBeginDrag: () => tracker.begin(owner),
      onScrollEndDrag: () => tracker.dragEnd(owner),
      onMomentumScrollBegin: () => tracker.begin(owner),
      onMomentumScrollEnd: () => tracker.end(owner),
    }),
    [owner],
  );
}
