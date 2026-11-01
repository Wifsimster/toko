import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { MO_GESTURES, moGesturePose } from "@focusflow/mo/child";

import { useReduceMotion, whenMotionAllowed } from "../../lib/reduce-motion";
import { Mo, type AppMoState } from "./mo";

const HALF_BREATH_MS = 2000;
const HOP = MO_GESTURES.saut;
const HOP_SAMPLES = 24;
const ART_UNITS = 188;

const hopTimes = Array.from({ length: HOP_SAMPLES + 1 }, (_, i) => i / HOP_SAMPLES);
const hopPoses = hopTimes.map((t) => moGesturePose(HOP, t));

const hidden = {
  accessible: false,
  accessibilityElementsHidden: true,
  importantForAccessibility: "no-hide-descendants",
} as const;

export function ChoiceMo({
  state,
  size,
  selected,
  delayMs = 0,
}: {
  state: AppMoState;
  size: number;
  selected: boolean;
  delayMs?: number;
}) {
  const reduceMotion = useReduceMotion();
  const [breath] = useState(() => new Animated.Value(0));
  const [hop] = useState(() => new Animated.Value(0));
  const wasSelected = useRef(selected);

  useEffect(() => {
    if (reduceMotion) {
      breath.setValue(0);
      return;
    }
    return whenMotionAllowed(() => {
      const half = { duration: HALF_BREATH_MS, easing: Easing.inOut(Easing.sin), useNativeDriver: true };
      const idle = Animated.sequence([
        Animated.delay(delayMs),
        Animated.loop(
          Animated.sequence([
            Animated.timing(breath, { toValue: 1, ...half }),
            Animated.timing(breath, { toValue: 0, ...half }),
          ]),
        ),
      ]);
      idle.start();
      return () => {
        idle.stop();
        breath.setValue(0);
      };
    });
  }, [reduceMotion, breath, delayMs]);

  useEffect(() => {
    const turnedOn = selected && !wasSelected.current;
    wasSelected.current = selected;
    if (!turnedOn || reduceMotion) {
      hop.setValue(0);
      return;
    }
    return whenMotionAllowed(() => {
      hop.setValue(0);
      const once = Animated.timing(hop, {
        toValue: 1,
        duration: HOP.durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      once.start();
      return () => {
        once.stop();
        hop.setValue(0);
      };
    });
  }, [selected, reduceMotion, hop]);

  const unit = size / ART_UNITS;
  const hopAt = (pick: (pose: (typeof hopPoses)[number]) => number) =>
    hop.interpolate({ inputRange: hopTimes, outputRange: hopPoses.map(pick) });

  return (
    <View {...hidden} style={{ width: size, height: size }}>
      <Animated.View
        {...hidden}
        style={{
          width: size,
          height: size,
          transformOrigin: "50% 100%",
          transform: [
            { translateY: hopAt((p) => p.lift * unit) },
            { scaleX: hopAt((p) => 1 - p.stretch / 2) },
            { scaleY: hopAt((p) => 1 + p.stretch) },
          ],
        }}
      >
        <Animated.View
          {...hidden}
          style={{
            width: size,
            height: size,
            transformOrigin: "50% 100%",
            transform: [
              { scaleX: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] }) },
              { scaleY: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) },
            ],
          }}
        >
          <Mo state={state} size={size} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
