import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  Check,
  ChevronRight,
  Egg,
  EggOff,
  Pause,
  PawPrint,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react-native";

import { Button, CalloutCard, Screen, ScreenHeader, fonts } from "../components/ui";
import { timer as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import { useTheme, type Palette } from "../lib/theme";
import { useActiveChild } from "../lib/active-child";
import { pickCritter, type Critter } from "../lib/critters";
import { useCompleteStep } from "../hooks/use-routines";
import { useRecordCompanion } from "../hooks/use-companions";
import type { TimerProps } from "../navigation/types";

// React Native port of the PWA visual timer (apps/web/src/components/timer).
// Two modes:
//  • free timer — presets, depleting dial, start/pause/reset, speed-up.
//  • sequence runner — chains a routine's timed steps, auto-completing each
//    step (POST /routines/:id/complete) as its countdown ends (the "killer
//    feature" for the exhausted parent).
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

export function TimerScreen({ navigation, route }: TimerProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const seq = route.params?.sequence;
  const completeStep = useCompleteStep();

  // Child scope for companions: explicit (sequence) or the active child (free).
  const activeChild = useActiveChild().active;
  const childId = seq?.childId ?? activeChild?.id ?? "";
  const childName = activeChild?.name ?? "";
  const recordCompanion = useRecordCompanion(childId);

  // Companion reward (collectible critters that hatch when a timer finishes).
  const [companionEnabled, setCompanionEnabled] = useState(true);
  const [revealed, setRevealed] = useState<Critter | null>(null);
  const [revealNew, setRevealNew] = useState(true);
  const revealedRef = useRef(false);

  // Sequence position (sequence mode only).
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false); // whole sequence done

  const seqStep = seq?.steps[stepIndex];
  const initialSec = seq ? (seqStep?.durationSec ?? DEFAULT_SEC) : DEFAULT_SEC;

  const [durationSec, setDurationSec] = useState(initialSec);
  const [remainingSec, setRemainingSec] = useState(initialSec);
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

  // Completes the current sequence step on the server (idempotent) and marks
  // the whole sequence finished when it was the last one.
  const finishStep = useCallback(() => {
    if (!seq || !seqStep) return;
    completeStep.mutate({
      childId: seq.childId,
      routineId: seq.routineId,
      stepId: seqStep.routineStepId,
      date: todayISO(),
    });
    if (stepIndex >= seq.steps.length - 1) setFinished(true);
  }, [seq, seqStep, stepIndex, completeStep]);

  // Ticking loop.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clear();
          setRunning(false);
          Vibration.vibrate(VIBRATION_PATTERN);
          if (seq) finishStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [running, clear, seq, finishStep]);

  function clearReveal() {
    revealedRef.current = false;
    setRevealed(null);
    setRevealNew(true);
  }

  function selectDuration(sec: number) {
    clear();
    setRunning(false);
    setDurationSec(sec);
    setRemainingSec(sec);
    clearReveal();
  }

  function toggleSpeedUp() {
    const next = !speedUp;
    setSpeedUp(next);
    selectDuration(next ? PRESET_SPEEDUP_SECONDS[1] : DEFAULT_SEC);
  }

  function toggleRun() {
    if (remainingSec === 0 && !seq) {
      clearReveal();
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
    clearReveal();
  }

  // Advance to the next sequence step and auto-start it.
  function nextStep() {
    if (!seq) return;
    const next = stepIndex + 1;
    if (next >= seq.steps.length) {
      setFinished(true);
      return;
    }
    clear();
    const sec = seq.steps[next]!.durationSec;
    setStepIndex(next);
    setDurationSec(sec);
    setRemainingSec(sec);
    setRunning(true);
  }

  const isFinished = remainingSec === 0;
  const almostDone = running && remainingSec > 0 && remainingSec <= ALMOST_DONE_SEC;
  const progress = durationSec > 0 ? remainingSec / durationSec : 0;
  const dashoffset = C * (1 - progress);
  const stepCompleted = !!seq && isFinished; // current step's timer ended

  const dialColor = isFinished ? c.success : almostDone ? c.danger : c.brand;

  // Hatch a companion once a timer (free) or the whole sequence completes.
  useEffect(() => {
    const done = seq ? finished : isFinished;
    if (!done || revealedRef.current || !companionEnabled || !childId) return;
    revealedRef.current = true;
    const cr = pickCritter();
    setRevealed(cr);
    recordCompanion.mutate(
      { childId, animalId: cr.id },
      { onSuccess: (data) => setRevealNew(!data.alreadyDiscovered) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq, finished, isFinished, companionEnabled, childId]);

  const goCollection = () =>
    navigation.navigate("CompanionCollection", { childId, childName });

  // ── Sequence finished screen ───────────────────────────────────────────
  if (seq && finished) {
    return (
      <Screen>
        <ScreenHeader title={seq.name} onBack={() => navigation.goBack()} />
        <View style={styles.finishWrap}>
          {revealed ? (
            <>
              <Text style={styles.revealEmoji}>{revealed.emoji}</Text>
              <Text style={styles.finishTitle}>{copy.sequenceFinished}</Text>
              <Text style={styles.revealName}>
                {revealNew ? copy.companionNew : copy.companionAgain} {revealed.name}
              </Text>
              <Button label={copy.viewCollection} onPress={goCollection} />
            </>
          ) : (
            <>
              <View style={styles.finishBadge}>
                <Check size={40} color="#fff" />
              </View>
              <Text style={styles.finishTitle}>{copy.sequenceFinished}</Text>
            </>
          )}
          <Button label={copy.quitSequence} variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
  }

  const statusText = seq
    ? copy.stepCounter(stepIndex + 1, seq.steps.length)
    : isFinished
      ? copy.finished
      : almostDone
        ? copy.almostDone
        : running
          ? copy.running
          : copy.ready;

  const presets = speedUp ? PRESET_SPEEDUP_SECONDS : PRESET_MINUTES.map((m) => m * 60);

  return (
    <Screen scroll>
      <ScreenHeader
        title={seq ? seq.name : copy.title}
        subtitle={seq ? seqStep?.label : undefined}
        onBack={seq ? () => navigation.goBack() : undefined}
      />
      {!seq ? <Text style={styles.subtitle}>{copy.subtitle}</Text> : null}

      {/* Presets — free mode only */}
      {!seq ? (
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
      ) : null}

      {/* Dial */}
      <View style={styles.dialWrap}>
        <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
          <Circle cx={DIAL_SIZE / 2} cy={DIAL_SIZE / 2} r={R} stroke={c.secondary} strokeWidth={STROKE} fill="none" />
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
          {seq && seqStep?.emoji ? <Text style={styles.stepEmoji}>{seqStep.emoji}</Text> : null}
          <Text style={[styles.time, { color: dialColor }]}>{fmt(remainingSec)}</Text>
          <Text style={styles.status}>{statusText}</Text>
        </View>
      </View>

      {/* Companion reveal — free mode */}
      {revealed && !seq ? (
        <CalloutCard
          variant="success"
          label={revealNew ? copy.companionNew : copy.companionAgain}
          icon={<Text style={styles.revealIcon}>{revealed.emoji}</Text>}
        >
          <Text style={styles.revealName}>{revealed.name}</Text>
          <Pressable onPress={goCollection} accessibilityRole="button">
            <Text style={styles.collectionLink}>{copy.viewCollection} ›</Text>
          </Pressable>
        </CalloutCard>
      ) : null}

      {/* Primary control */}
      {stepCompleted && seq ? (
        <Button
          label={stepIndex >= seq.steps.length - 1 ? copy.sequenceFinished : copy.nextStep}
          icon={<ChevronRight size={18} color="#fff" />}
          onPress={nextStep}
        />
      ) : (
        <Button
          label={running ? copy.pause : remainingSec < durationSec ? copy.resume : copy.start}
          icon={running ? <Pause size={20} color="#fff" fill="#fff" /> : <Play size={20} color="#fff" fill="#fff" />}
          onPress={toggleRun}
        />
      )}

      {/* Secondary control */}
      {seq ? (
        <Button label={copy.quitSequence} variant="secondary" onPress={() => navigation.goBack()} />
      ) : (
        <Button
          label={copy.reset}
          variant="secondary"
          icon={<RotateCcw size={18} color={c.text} />}
          onPress={reset}
        />
      )}

      {/* Speed-up — free mode only */}
      {!seq ? (
        <>
          <Pressable
            onPress={toggleSpeedUp}
            style={[styles.speedRow, speedUp && styles.speedRowOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: speedUp }}
          >
            <Zap size={16} color={speedUp ? c.alertFg : c.muted} fill={speedUp ? c.alertFg : "none"} />
            <Text style={[styles.speedText, speedUp && styles.speedTextOn]}>
              {speedUp ? copy.speedUpOn : copy.speedUpOff}
            </Text>
          </Pressable>
          {speedUp ? <Text style={styles.speedHint}>{copy.speedUpHint}</Text> : null}

          {/* Companion controls */}
          <Pressable
            onPress={() => setCompanionEnabled((v) => !v)}
            style={[styles.speedRow, companionEnabled && styles.companionRowOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: companionEnabled }}
          >
            {companionEnabled ? (
              <Egg size={16} color={c.infoFg} />
            ) : (
              <EggOff size={16} color={c.muted} />
            )}
            <Text style={[styles.speedText, companionEnabled && styles.companionTextOn]}>
              {companionEnabled ? copy.companionOn : copy.companionOff}
            </Text>
          </Pressable>
          {childId ? (
            <Pressable
              onPress={goCollection}
              style={styles.collectionRow}
              accessibilityRole="button"
            >
              <PawPrint size={15} color={c.muted} />
              <Text style={styles.collectionLink}>{copy.viewCollection}</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    subtitle: { fontSize: 14, color: c.muted, fontFamily: fonts.body, lineHeight: 20 },
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
    dialCenter: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: 4 },
    stepEmoji: { fontSize: 30 },
    time: { fontSize: 56, fontFamily: fonts.bold, fontVariant: ["tabular-nums"] },
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
    speedHint: { fontSize: 12, color: c.muted, fontFamily: fonts.body, textAlign: "center", lineHeight: 17 },
    finishWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
    finishBadge: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: c.success,
      alignItems: "center",
      justifyContent: "center",
    },
    finishTitle: { fontSize: 24, color: c.text, fontFamily: fonts.heading, textAlign: "center" },
    revealEmoji: { fontSize: 88 },
    revealIcon: { fontSize: 22 },
    revealName: { fontSize: 16, color: c.text, fontFamily: fonts.semibold, textAlign: "center" },
    companionRowOn: { backgroundColor: c.infoSurface, borderColor: c.infoBorder },
    companionTextOn: { color: c.infoFg, fontFamily: fonts.semibold },
    collectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 8,
    },
    collectionLink: { color: c.action, fontFamily: fonts.semibold, fontSize: 14 },
  });
