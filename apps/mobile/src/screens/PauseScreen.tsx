import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { useAnimatedStyle, useDerivedValue, useFrameCallback, useSharedValue } from "react-native-reanimated";
import { ChevronLeft, Pause as PauseIcon, Play } from "lucide-react-native";
import { PAUSE_DURATIONS_MINUTES } from "@focusflow/validators";

import { Button, Screen, fonts } from "../components/ui";
import { Mo } from "../components/mo/mo";
import { MoodFace } from "../components/mo/mood-face";
import { GardenPot } from "../components/pause/garden-pot";
import { pause as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import { useReduceMotion } from "../lib/reduce-motion";
import { useTheme, type Palette } from "../lib/theme";
import { breathCircleScale, breathLevelAt, breathPhaseAt, type BreathPhase } from "../lib/sos";
import {
  PAUSE_DEFAULT_MINUTES,
  clockElapsed,
  formatCountdown,
  pauseMinutesWords,
  remainingMs,
  resumeClock,
  splitCountdown,
  startClock,
  stopClock,
  type PauseClock,
} from "../lib/pause";
import { useCreatePause, useGarden } from "../hooks/use-pauses";
import { useUpsertParentMood } from "../hooks/use-parent-mood";
import type { PauseProps } from "../navigation/types";

const MO_SIZE = 112;
const CIRCLE_SIZE = 224;
const TICK_MS = 250;

export function PauseScreen({ navigation }: PauseProps) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const [minutes, setMinutes] = useState<number>(PAUSE_DEFAULT_MINUTES);
  const [run, setRun] = useState(0);
  const [done, setDone] = useState<number | null>(null);
  const { mutate: recordPause } = useCreatePause();

  useFocusEffect(
    useCallback(() => {
      const tabs = navigation.getParent();
      tabs?.setOptions({ tabBarStyle: { display: "none" } });
      return () => tabs?.setOptions({ tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border } });
    }, [navigation, c]),
  );

  function restart(next: number) {
    setMinutes(next);
    setDone(null);
    setRun((n) => n + 1);
  }

  return (
    <Screen scroll>
      <Pressable
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel={copy.back}
        style={s.back}
      >
        <ChevronLeft size={22} color={c.text} />
        <Text style={s.backText}>{copy.back}</Text>
      </Pressable>
      {done === null ? (
        <BreathingPause
          key={run}
          minutes={minutes}
          onMinutes={restart}
          onComplete={() => {
            recordPause({ kind: "souffler", date: todayISO(), durationSeconds: minutes * 60 });
            setDone(minutes);
          }}
        />
      ) : (
        <PauseEnd
          minutes={done}
          onHome={() => navigation.popToTop()}
          onAgain={() => restart(1)}
        />
      )}
    </Screen>
  );
}

function BreathingPause({
  minutes,
  onMinutes,
  onComplete,
}: {
  minutes: number;
  onMinutes: (minutes: number) => void;
  onComplete: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const reduceMotion = useReduceMotion();
  const clock = useSharedValue(0);
  const timer = useRef<PauseClock>(startClock(Date.now()));
  const finished = useRef(false);
  const complete = useRef(onComplete);
  useEffect(() => {
    complete.current = onComplete;
  }, [onComplete]);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const animate = running && !reduceMotion;

  useFrameCallback((info) => {
    clock.value += info.timeSincePreviousFrame ?? 0;
  }, animate);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const now = clockElapsed(timer.current, Date.now());
      setElapsed(now);
      setPhase(breathPhaseAt(reduceMotion ? now : clock.value));
      if (!finished.current && remainingMs(minutes, now) === 0) {
        finished.current = true;
        complete.current();
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, reduceMotion, minutes, clock]);

  function toggle() {
    const now = Date.now();
    timer.current = running ? stopClock(timer.current, now) : resumeClock(timer.current, now);
    setRunning(!running);
  }

  const level = useDerivedValue(() => (reduceMotion ? 0 : breathLevelAt(clock.value)));
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : breathCircleScale(level.value) }],
  }));
  const left = remainingMs(minutes, elapsed);
  const parts = splitCountdown(left);
  const hint = copy.phaseHints[phase];

  return (
    <View style={s.block}>
      <View style={s.head}>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={s.phase}>
          {copy.phases[phase]}
        </Text>
        <Text style={s.hint} importantForAccessibility={hint ? "auto" : "no"}>
          {hint || " "}
        </Text>
      </View>
      <View style={s.circleWrap}>
        <Animated.View style={[s.circle, circleStyle]} />
        <View style={s.moWrap}>
          <Mo state="calme" size={MO_SIZE} guidedBreath={level} />
        </View>
      </View>
      <Text style={s.note} importantForAccessibility="no" accessibilityElementsHidden>
        {copy.note}
      </Text>
      <Text
        style={s.countdown}
        accessible
        accessibilityRole="timer"
        accessibilityLabel={copy.remaining(parts.minutes, parts.seconds)}
      >
        {formatCountdown(left)}
      </Text>
      <View style={s.segments} accessibilityRole="radiogroup" accessibilityLabel={copy.durationLabel}>
        {PAUSE_DURATIONS_MINUTES.map((m) => {
          const on = m === minutes;
          return (
            <Pressable
              key={m}
              onPress={() => {
                if (!on) onMinutes(m);
              }}
              accessibilityRole="radio"
              accessibilityLabel={copy.durationLong(m)}
              accessibilityState={{ checked: on }}
              style={[s.segment, on && s.segmentOn]}
            >
              <Text style={[s.segmentText, on && s.segmentTextOn]}>{copy.durationShort(m)}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={running ? copy.pauseButton : copy.resumeButton}
        style={({ pressed }) => [s.toggle, pressed && s.pressed]}
      >
        {running ? (
          <PauseIcon size={30} color={c.onPrimary} fill={c.onPrimary} />
        ) : (
          <Play size={30} color={c.onPrimary} fill={c.onPrimary} />
        )}
      </Pressable>
    </View>
  );
}

function PauseEnd({ minutes, onHome, onAgain }: { minutes: number; onHome: () => void; onAgain: () => void }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const garden = useGarden();
  const upsertMood = useUpsertParentMood();
  const [picked, setPicked] = useState<number | null>(null);
  const leaves = garden.data?.leaves ?? 0;

  return (
    <View style={s.block}>
      <View style={s.endArt}>
        <Mo state="fierte" size={96} />
        <GardenPot leaves={leaves} width={120} freshLast={leaves > 0} />
      </View>
      <View style={s.head}>
        <Text style={s.noteHand} importantForAccessibility="no" accessibilityElementsHidden>
          {copy.endNote}
        </Text>
        <Text accessibilityRole="header" style={s.endTitle}>
          {copy.endTitle}
        </Text>
        <Text style={s.endBody}>{copy.endBody(pauseMinutesWords(minutes))}</Text>
      </View>
      <View style={s.moodCard}>
        <Text style={s.moodQuestion} accessibilityRole="header">
          {copy.moodQuestion}
        </Text>
        <View style={s.moodRow}>
          {copy.moods.map((m) => {
            const on = picked === m.score;
            return (
              <Pressable
                key={m.score}
                onPress={() => {
                  setPicked(m.score);
                  upsertMood.mutate({ date: todayISO(), score: m.score });
                }}
                accessibilityRole="button"
                accessibilityLabel={m.label}
                accessibilityState={{ selected: on }}
                style={[s.moodBtn, on && s.moodBtnOn]}
              >
                <MoodFace state={m.state} size={36} />
                <Text style={s.moodLabel}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={s.moodHint}>{copy.moodHint}</Text>
      </View>
      <View style={s.endActions}>
        <Button label={copy.goHome} onPress={onHome} />
        <Pressable
          onPress={onAgain}
          accessibilityRole="button"
          accessibilityLabel={copy.again}
          style={({ pressed }) => [s.ghost, pressed && s.pressed]}
        >
          <Text style={s.ghostText}>{copy.again}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const TOGGLE_SIZE = 72;

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    back: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", minHeight: 44, paddingRight: 12, gap: 2 },
    backText: { fontFamily: fonts.medium, fontSize: 16, color: c.text },
    block: { width: "100%", alignItems: "center", gap: 20 },
    head: { alignItems: "center", gap: 4 },
    phase: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34, color: c.text, textAlign: "center" },
    hint: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: c.muted, textAlign: "center" },
    circleWrap: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: "center", justifyContent: "center" },
    circle: {
      position: "absolute",
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      borderRadius: CIRCLE_SIZE / 2,
      backgroundColor: c.surfaceMint,
      borderWidth: 2,
      borderColor: "rgba(53, 136, 145, 0.25)",
    },
    moWrap: { transform: [{ translateY: -12 }] },
    note: { fontFamily: fonts.hand, fontSize: 22, color: c.text, textAlign: "center" },
    noteHand: { fontFamily: fonts.hand, fontSize: 21, color: c.text, textAlign: "center" },
    countdown: {
      fontFamily: fonts.semibold,
      fontSize: 34,
      color: c.text,
      fontVariant: ["tabular-nums"],
      textAlign: "center",
    },
    segments: {
      flexDirection: "row",
      padding: 4,
      gap: 4,
      borderRadius: 999,
      backgroundColor: c.mutedSurface,
    },
    segment: {
      minHeight: 44,
      minWidth: 76,
      paddingHorizontal: 14,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentOn: { backgroundColor: c.card, borderWidth: 1.5, borderColor: c.primary },
    segmentText: { fontFamily: fonts.medium, fontSize: 15, color: c.subtext },
    segmentTextOn: { fontFamily: fonts.semibold, color: c.text },
    toggle: {
      width: TOGGLE_SIZE,
      height: TOGGLE_SIZE,
      borderRadius: TOGGLE_SIZE / 2,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: { opacity: 0.85 },
    endArt: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 8 },
    endTitle: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34, color: c.text, textAlign: "center" },
    endBody: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: c.subtext, textAlign: "center", maxWidth: 360 },
    moodCard: {
      alignSelf: "stretch",
      backgroundColor: c.surfaceMint,
      borderRadius: 22,
      padding: 16,
      gap: 12,
    },
    moodQuestion: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
    moodRow: { flexDirection: "row", gap: 8 },
    moodBtn: {
      flex: 1,
      minHeight: 72,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    moodBtnOn: { borderColor: c.primary, borderWidth: 1.5 },
    moodLabel: { fontFamily: fonts.medium, fontSize: 13, color: c.subtext, textAlign: "center" },
    moodHint: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: c.muted },
    endActions: { alignSelf: "stretch", gap: 8 },
    ghost: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 999 },
    ghostText: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
  });
