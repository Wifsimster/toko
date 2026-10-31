import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, type StyleProp, type ViewStyle } from "react-native";
import {
  childMoArt,
  MO_GESTURES,
  MO_WAVE_BODY,
  MO_WAVE_DURATION_MS,
  MO_WAVE_HAND,
  moGesturePose,
  moWaveAngle,
  pickMoSize,
  type ChildMoState,
  type MoArt,
  type MoGestureName,
  type MoSize,
} from "@focusflow/mo/child";
import { parentMoArt, type ParentMoState } from "@focusflow/mo/parent";
import { themeMoArt, type ThemeMoState } from "@focusflow/mo/themes";
import { crisisMoArt, type CrisisMoState } from "@focusflow/mo/crisis";

import type { SharedValue } from "react-native-reanimated";

import { mo as copy } from "../../lib/copy";
import { useReduceMotion, whenMotionAllowed } from "../../lib/reduce-motion";
import { ArtSvg, type WavePose } from "./art";

export type AppMoState = ChildMoState | ParentMoState | ThemeMoState | CrisisMoState;

export const MO_ART: Record<AppMoState, Record<MoSize, MoArt>> = {
  ...childMoArt,
  ...parentMoArt,
  ...themeMoArt,
  ...crisisMoArt,
};

export function a11yImage(label: string | undefined) {
  return label
    ? ({ accessible: true, accessibilityRole: "image", accessibilityLabel: label } as const)
    : ({
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: "no-hide-descendants",
      } as const);
}

function usePlayOnce(durationMs: number, enabled: boolean, reduceMotion: boolean, run: number): number | undefined {
  const [progress, setProgress] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!enabled || reduceMotion) return;
    return whenMotionAllowed(() => {
      let frame = 0;
      let start: number | undefined;
      const step = (now: number) => {
        start ??= now;
        const t = (now - start) / durationMs;
        if (t >= 1) {
          setProgress(undefined);
          return;
        }
        setProgress(t);
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      return () => {
        cancelAnimationFrame(frame);
        setProgress(undefined);
      };
    });
  }, [durationMs, enabled, reduceMotion, run]);
  return enabled && !reduceMotion ? progress : undefined;
}

type MoProps = {
  state: AppMoState;
  size: number;
  label?: string | true;
  breathe?: boolean;
  wave?: boolean;
  gesture?: MoGestureName;
  guidedBreath?: SharedValue<number>;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Mo({ state, size, label, breathe = false, wave = false, gesture, guidedBreath, shadow = true, style }: MoProps) {
  const art = MO_ART[state][pickMoSize(size)];
  const reduceMotion = useReduceMotion();
  const breath = useRef(new Animated.Value(0)).current;
  const canWave = wave && !!art.wave;
  const moves = gesture && art.ground ? MO_GESTURES[gesture] : undefined;
  const [run, setRun] = useState(0);
  const waveT = usePlayOnce(MO_WAVE_DURATION_MS, canWave, reduceMotion, run);
  const wavePose: WavePose | undefined =
    waveT === undefined ? undefined : { hand: moWaveAngle(MO_WAVE_HAND, waveT), body: moWaveAngle(MO_WAVE_BODY, waveT) };
  const gestureT = usePlayOnce(moves?.durationMs ?? 0, !!moves, reduceMotion, run);
  const gesturePose = moves && gestureT !== undefined ? moGesturePose(moves, gestureT) : undefined;
  const playing = waveT !== undefined || gestureT !== undefined;

  useEffect(() => {
    if (!breathe || reduceMotion) {
      breath.setValue(0);
      return;
    }
    return whenMotionAllowed(() => {
      const half = { duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true };
      const once = Animated.sequence([
        Animated.timing(breath, { toValue: 1, ...half }),
        Animated.timing(breath, { toValue: 0, ...half }),
      ]);
      once.start();
      return () => {
        once.stop();
        breath.setValue(0);
      };
    });
  }, [breathe, reduceMotion, breath]);

  const name = label === true ? copy.label[state] : label;
  const drawing = <ArtSvg art={art} size={size} shadow={shadow} wave={wavePose} gesture={gesturePose} breath={guidedBreath} />;
  return (
    <Animated.View
      {...a11yImage(name)}
      style={[
        {
          width: size,
          height: size,
          transformOrigin: "50% 100%",
          transform: [
            { scaleX: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] }) },
            { scaleY: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) },
          ],
        },
        style,
      ]}
    >
      {canWave || moves ? (
        <Pressable
          accessible={false}
          focusable={false}
          importantForAccessibility="no"
          onPress={() => {
            if (!playing) setRun((n) => n + 1);
          }}
        >
          {drawing}
        </Pressable>
      ) : (
        drawing
      )}
    </Animated.View>
  );
}
