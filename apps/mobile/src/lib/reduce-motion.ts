import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduceMotion;
}

export function whenMotionAllowed(start: () => () => void): () => void {
  let stop: (() => void) | undefined;
  let alive = true;
  AccessibilityInfo.isReduceMotionEnabled().then(
    (reduced) => {
      if (alive && !reduced) stop = start();
    },
    () => {
    },
  );
  return () => {
    alive = false;
    stop?.();
  };
}
