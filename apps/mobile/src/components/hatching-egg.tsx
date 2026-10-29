import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import type { CompanionId, PictoName } from "@focusflow/mo/child";

import { useReduceMotion } from "../lib/reduce-motion";
import { Companion, Picto } from "./mo/companion";

export function eggStage(progress: number): Extract<PictoName, `oeuf-${number}`> {
  if (progress > 0.75) return "oeuf-0";
  if (progress > 0.5) return "oeuf-1";
  if (progress > 0.25) return "oeuf-2";
  return "oeuf-3";
}

type Props = {
  progress: number;
  wobbling: boolean;
  hatched: CompanionId | null;
  hatchedLabel?: string;
  eggLabel?: string;
  size?: number;
};

export function HatchingEgg({ progress, wobbling, hatched, hatchedLabel, eggLabel, size = 120 }: Props) {
  const reduceMotion = useReduceMotion();

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
    const unit = size / 1.17;
    const critter = Math.round(unit * 0.9);
    const shell = Math.round(unit * 0.72);
    return (
      <View style={{ width: size, height: size }}>
        <Picto name="oeuf-ouvert" size={shell} style={[styles.abs, { bottom: 0, left: (size - shell) / 2 }]} />
        <Animated.View
          style={[styles.abs, { bottom: unit * 0.27, left: (size - critter) / 2, transform: [{ scale: rise }] }]}
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
  abs: { position: "absolute" },
});
