import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

// Companion egg shown at the center of the timer dial ("fissures par étapes").
// The egg cracks at fixed milestones of the countdown (¾, ½, ¼ of the time
// left), trembles during the final seconds, then opens to reveal the hatched
// critter. Milestones are discrete on purpose: a child with ADHD can "read"
// the remaining time on the shell, and nothing moves between two milestones.

const SHELL = "#f5e7cf";
const SHELL_EDGE = "#d9c39a";
const CRACK = "#b98d4f";

const EGG_PATH =
  "M50 6 C70 6 88 33 88 60 C88 83 71 98 50 98 C29 98 12 83 12 60 C12 33 30 6 50 6 Z";
// Lower half of the shell with a jagged rim, shown once the egg has hatched.
const EGG_BOTTOM_PATH =
  "M14 62 C16 82 30 96 50 96 C70 96 84 82 86 62 L78 56 L70 64 L60 55 L50 64 L40 55 L30 64 L22 56 Z";
// One crack per milestone, revealed when `progress` drops below `at`.
const CRACKS = [
  { at: 0.75, d: "M33 32 l8 6 l-5 7 l9 5" },
  { at: 0.5, d: "M69 46 l-7 6 l7 6 l-5 7" },
  { at: 0.25, d: "M42 64 l7 6 l-5 6 l10 5" },
] as const;

type Props = {
  /** Remaining fraction of the timer, 1 (full) → 0 (done). */
  progress: number;
  /** Gentle tremble during the final seconds (timer running + almost done). */
  wobbling: boolean;
  /** Critter emoji once hatched; null while the egg is still closed. */
  hatchedEmoji: string | null;
  size?: number;
};

/** Fades to 1 when `on`, snaps back to 0 when it turns off (timer reset). */
function useReveal(on: boolean, reduceMotion: boolean): Animated.Value {
  const value = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    if (on) {
      Animated.timing(value, {
        toValue: 1,
        duration: reduceMotion ? 0 : 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      value.setValue(0);
    }
  }, [on, reduceMotion, value]);
  return value;
}

export function HatchingEgg({ progress, wobbling, hatchedEmoji, size = 72 }: Props) {
  const height = (size * 104) / 100;
  const hatched = hatchedEmoji != null;

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

  const crackValues = [
    useReveal(!hatched && progress <= CRACKS[0].at, reduceMotion),
    useReveal(!hatched && progress <= CRACKS[1].at, reduceMotion),
    useReveal(!hatched && progress <= CRACKS[2].at, reduceMotion),
  ];

  // Tremble: small rotation loop around the egg's center.
  const wobble = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!wobbling || hatched || reduceMotion) {
      wobble.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: -1,
          duration: 440,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: 0,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      wobble.setValue(0);
    };
  }, [wobbling, hatched, reduceMotion, wobble]);
  const rotate = wobble.interpolate({ inputRange: [-1, 1], outputRange: ["-4deg", "4deg"] });

  // Hatch: whole shell fades out, jagged bottom fades in, critter springs up.
  const opened = useReveal(hatched, reduceMotion);
  const wholeOpacity = opened.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const critterScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (hatched) {
      Animated.spring(critterScale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }).start();
    } else {
      critterScale.setValue(0);
    }
  }, [hatched, critterScale]);

  return (
    <Animated.View style={{ width: size, height, transform: [{ rotate }] }}>
      {/* Closed egg + milestone cracks */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: wholeOpacity }]}>
        <Svg width={size} height={height} viewBox="0 0 100 104">
          <Path d={EGG_PATH} fill={SHELL} stroke={SHELL_EDGE} strokeWidth={3} />
        </Svg>
        {CRACKS.map((crack, i) => (
          <Animated.View
            key={crack.at}
            style={[StyleSheet.absoluteFill, { opacity: crackValues[i] }]}
          >
            <Svg width={size} height={height} viewBox="0 0 100 104">
              <Path
                d={crack.d}
                fill="none"
                stroke={CRACK}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        ))}
      </Animated.View>
      {/* Critter rises behind the broken shell rim */}
      {hatched ? (
        <Animated.Text
          style={[
            styles.critter,
            {
              bottom: height * 0.24,
              fontSize: size * 0.58,
              transform: [{ scale: critterScale }],
            },
          ]}
        >
          {hatchedEmoji}
        </Animated.Text>
      ) : null}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: opened }]}>
        <Svg width={size} height={height} viewBox="0 0 100 104">
          <Path d={EGG_BOTTOM_PATH} fill={SHELL} stroke={SHELL_EDGE} strokeWidth={3} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  critter: { position: "absolute", alignSelf: "center" },
});
