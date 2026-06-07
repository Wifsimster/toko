import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Pause, Play, RotateCcw, Zap } from "lucide-react-native";

import { Button, Screen, ScreenHeader, fonts } from "../components/ui";
import { timer as copy } from "../lib/copy";
import { useTheme, type Palette } from "../lib/theme";

// React Native port of the PWA visual timer (apps/web/src/components/timer).
// Core parity: presets, a depleting dial, start/pause/reset, a "speed-up" mode
// for short challenges, an "almost done" warning and a vibration on finish.
// (Companion/critter gamification and routine sequence-chaining from the web
// are tracked as follow-ups.)
const PRESET_MINUTES = [2, 5, 10, 20, 45] as const;
const PRESET_SPEEDUP_SECONDS = [30, 60, 120, 180] as const;
const DEFAULT_SEC = 10 * 60;
const ALMOST_DONE_SEC = 10;
const VIBRATION_PATTERN = [0, 400, 200, 400, 200, 600];

const DIAL_SIZE = 260;
const STROKE = 18;
const R = (DIAL_SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

function fmt(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TimerScreen() {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [durationSec, setDurationSec] = useState(DEFAULT_SEC);
  const [remainingSec, setRemainingSec] = useState(DEFAULT_SEC);
  const [running, setRunning] = useState(false);
  const [speedUp, setSpeedUp] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  // The ticking loop. Re-created whenever `running` flips.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clear();
          setRunning(false);
          Vibration.vibrate(VIBRATION_PATTERN);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [running, clear]);

  function selectDuration(sec: number) {
    clear();
    setRunning(false);
    setDurationSec(sec);
    setRemainingSec(sec);
  }

  function toggleSpeedUp() {
    const next = !speedUp;
    setSpeedUp(next);
    const sec = next ? PRESET_SPEEDUP_SECONDS[1] : DEFAULT_SEC;
    selectDuration(sec);
  }

  function toggleRun() {
    if (remainingSec === 0) {
      // Restart from the chosen duration.
      setRemainingSec(durationSec);
      setRunning(true);
      return;
    }
    setRunning((r) => !r);
  }

  function reset() {
    clear();
    setRunning(false);
    setRemainingSec(durationSec);
  }

  const finished = remainingSec === 0;
  const almostDone = running && remainingSec > 0 && remainingSec <= ALMOST_DONE_SEC;
  const progress = durationSec > 0 ? remainingSec / durationSec : 0;
  const dashoffset = C * (1 - progress);

  const dialColor = finished
    ? c.success
    : almostDone
      ? c.danger
      : c.brand;

  const statusText = finished
    ? copy.finished
    : almostDone
      ? copy.almostDone
      : running
        ? copy.running
        : copy.ready;

  const presets = speedUp ? PRESET_SPEEDUP_SECONDS : PRESET_MINUTES.map((m) => m * 60);

  return (
    <Screen scroll>
      <ScreenHeader title={copy.title} />
      <Text style={styles.subtitle}>{copy.subtitle}</Text>

      {/* Presets */}
      <View style={styles.presets}>
        {presets.map((sec) => {
          const on = durationSec === sec;
          return (
            <Pressable
              key={sec}
              onPress={() => selectDuration(sec)}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {speedUp ? copy.secondsLabel(sec) : copy.minutesLabel(sec / 60)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Dial */}
      <View style={styles.dialWrap}>
        <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
          <Circle
            cx={DIAL_SIZE / 2}
            cy={DIAL_SIZE / 2}
            r={R}
            stroke={c.secondary}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={DIAL_SIZE / 2}
            cy={DIAL_SIZE / 2}
            r={R}
            stroke={dialColor}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${DIAL_SIZE / 2} ${DIAL_SIZE / 2})`}
          />
        </Svg>
        <View style={styles.dialCenter} pointerEvents="none">
          <Text style={[styles.time, { color: dialColor }]}>
            {fmt(remainingSec)}
          </Text>
          <Text style={styles.status}>{statusText}</Text>
        </View>
      </View>

      {/* Controls */}
      <Button
        label={finished ? copy.start : running ? copy.pause : remainingSec < durationSec ? copy.resume : copy.start}
        icon={
          running ? (
            <Pause size={20} color="#fff" fill="#fff" />
          ) : (
            <Play size={20} color="#fff" fill="#fff" />
          )
        }
        onPress={toggleRun}
      />
      <Button
        label={copy.reset}
        variant="secondary"
        icon={<RotateCcw size={18} color={c.text} />}
        onPress={reset}
      />

      {/* Speed-up mode */}
      <Pressable
        onPress={toggleSpeedUp}
        style={[styles.speedRow, speedUp && styles.speedRowOn]}
        accessibilityRole="button"
        accessibilityState={{ selected: speedUp }}
      >
        <Zap
          size={16}
          color={speedUp ? c.alertFg : c.muted}
          fill={speedUp ? c.alertFg : "none"}
        />
        <Text style={[styles.speedText, speedUp && styles.speedTextOn]}>
          {speedUp ? copy.speedUpOn : copy.speedUpOff}
        </Text>
      </Pressable>
      {speedUp ? <Text style={styles.speedHint}>{copy.speedUpHint}</Text> : null}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    subtitle: {
      fontSize: 14,
      color: c.muted,
      fontFamily: fonts.body,
      lineHeight: 20,
    },
    presets: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
      marginTop: 4,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      minHeight: 40,
      justifyContent: "center",
    },
    chipOn: { backgroundColor: c.brand, borderColor: c.brand },
    chipText: { color: c.subtext, fontFamily: fonts.medium, fontSize: 14 },
    chipTextOn: { color: "#fff", fontFamily: fonts.semibold },
    dialWrap: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 12,
      width: DIAL_SIZE,
      height: DIAL_SIZE,
      alignSelf: "center",
    },
    dialCenter: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    time: {
      fontSize: 56,
      fontFamily: fonts.bold,
      fontVariant: ["tabular-nums"],
    },
    status: { fontSize: 14, color: c.muted, fontFamily: fonts.medium },
    speedRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      alignSelf: "center",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      marginTop: 4,
    },
    speedRowOn: { backgroundColor: c.alertSurface, borderColor: c.alertBorder },
    speedText: { fontSize: 13, color: c.muted, fontFamily: fonts.medium },
    speedTextOn: { color: c.alertFg, fontFamily: fonts.semibold },
    speedHint: {
      fontSize: 12,
      color: c.muted,
      fontFamily: fonts.body,
      textAlign: "center",
      lineHeight: 17,
    },
  });
