import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import type { CompanionId, PictoName } from "@focusflow/mo/child";

import { useReduceMotion } from "../lib/reduce-motion";
import { Companion, Picto } from "./mo/companion";

// Companion egg shown at the center of the timer dial ("fissures par étapes").
// The egg cracks at fixed milestones of the countdown (¾, ½, ¼ of the time
// left), trembles during the final seconds, then opens to reveal the hatched
// critter. Milestones are discrete on purpose: a child with ADHD can "read"
// the remaining time on the shell, and nothing moves between two milestones.
// Drawings: the « Mō » direction pictos `oeuf-0` … `oeuf-3` and `oeuf-ouvert`.

/** Shell drawing for a remaining fraction (1 → 0): intact, then one crack per milestone. */
export function eggStage(progress: number): Extract<PictoName, `oeuf-${number}`> {
  if (progress > 0.75) return "oeuf-0";
  if (progress > 0.5) return "oeuf-1";
  if (progress > 0.25) return "oeuf-2";
  return "oeuf-3";
}

type Props = {
  /** Remaining fraction of the timer, 1 (full) → 0 (done). */
  progress: number;
  /** Gentle tremble during the final seconds (timer running + almost done). */
  wobbling: boolean;
  /** Hatched companion; null while the egg is still closed. */
  hatched: CompanionId | null;
  /** Spoken name of the hatched companion (« Le renard »). */
  hatchedLabel?: string;
  /** Spoken description of the closed egg. */
  eggLabel?: string;
  size?: number;
};

export function HatchingEgg({ progress, wobbling, hatched, hatchedLabel, eggLabel, size = 120 }: Props) {
  const reduceMotion = useReduceMotion();

  // Tremble: small rotation loop around the egg's center.
  const wobble = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!wobbling || hatched || reduceMotion) {
      wobble.setValue(0);
      return;
    }
    const step = (toValue: number, duration: number) =>
      Animated.timing(wobble, { toValue, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
    const loop = Animated.loop(Animated.sequence([step(1, 220), step(-1, 440), step(0, 220)]));
    loop.start();
    return () => {
      loop.stop();
      wobble.setValue(0);
    };
  }, [wobbling, hatched, reduceMotion, wobble]);
  const rotate = wobble.interpolate({ inputRange: [-1, 1], outputRange: ["-4deg", "4deg"] });

  // Hatch: the critter springs up out of the open shell (no motion when reduced).
  const rise = useRef(new Animated.Value(hatched ? 1 : 0)).current;
  useEffect(() => {
    if (!hatched) {
      rise.setValue(0);
    } else if (reduceMotion) {
      rise.setValue(1);
    } else {
      Animated.spring(rise, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    }
  }, [hatched, reduceMotion, rise]);

  if (hatched) {
    const critter = Math.round(size * 0.78);
    return (
      <View style={{ width: size, height: size }}>
        <Picto name="oeuf-ouvert" size={size} style={StyleSheet.absoluteFill} />
        <Animated.View
          style={[
            styles.critter,
            { bottom: size * 0.36, left: (size - critter) / 2, transform: [{ scale: rise }] },
          ]}
        >
          <Companion id={hatched} variant="large" size={critter} label={hatchedLabel} />
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
      <Picto name={eggStage(progress)} size={size} label={eggLabel} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  critter: { position: "absolute" },
});
