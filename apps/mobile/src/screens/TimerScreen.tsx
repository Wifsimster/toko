import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import {
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
import { HatchingEgg } from "../components/hatching-egg";
import { MoSays } from "../components/mo/mo-says";
import { Picto } from "../components/mo/companion";
import { TimerDial } from "../components/timer-dial";
import { mo, timer as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import { useTheme, type Palette } from "../lib/theme";
import { useActiveChild } from "../lib/active-child";
import { pickCritter, type Critter } from "../lib/critters";
import { pictoForStep } from "../lib/icon-for";
import { useCompleteStep } from "../hooks/use-routines";
import { useRecordCompanion } from "../hooks/use-companions";
import type { TimerProps } from "../navigation/types";
import { backIfPushed } from "../navigation/tabs";

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
// What sits at the dial's center: the egg (free timer) or the step's picto.
const EGG_SIZE = 120;
const STEP_PICTO_SIZE = 112;
// Mō next to the dial (guide, veille) and on the end screen (bravo).
const MO_SIZE = 112;

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

  // Soft chime played when a timer (or a sequence step) ends. Loaded once;
  // replayed by seeking back to the start.
  const finishSound = useAudioPlayer(require("../../assets/timer-done.wav"));
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

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
          finishSound.seekTo(0);
          finishSound.play();
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
  const stepCompleted = !!seq && isFinished; // current step's timer ended

  // The time itself stays in ink: Mō does not count or hurry.
  const arcColor = isFinished ? c.success : almostDone ? c.danger : c.brand;
  const stepPicto = seqStep ? pictoForStep(seqStep.label, seqStep.emoji) : undefined;

  // Companion egg at the dial's center (free mode): cracks at fixed milestones
  // of the countdown, trembles near the end, opens on the hatched critter.
  const showEgg = !seq && companionEnabled && !!childId;

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
          <Text style={styles.finishTitle}>{copy.sequenceFinished}</Text>
          {revealed ? (
            <>
              {/* Mō applaudit, en petit et sur le côté : le compagnon reste la vedette. */}
              <View style={styles.finishScene}>
                <MoSays state="bravo" size={MO_SIZE} text={mo.bravo} moSide="below" />
                <HatchingEgg progress={0} wobbling={false} hatched={revealed.id} hatchedLabel={revealed.name} size={180} />
              </View>
              <Text style={styles.revealName}>
                {revealNew ? copy.companionNew : copy.companionAgain} {revealed.name}
              </Text>
              <Button label={copy.viewCollection} onPress={goCollection} />
            </>
          ) : (
            <MoSays state="bravo" size={MO_SIZE + 16} text={mo.bravo} moSide="below" />
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
        onBack={seq ? () => navigation.goBack() : backIfPushed(navigation)}
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

      {/* Dial: hand-drawn background, live arc, egg or step picto at the center */}
      <View style={styles.dialWrap}>
        <TimerDial size={DIAL_SIZE} progress={progress} color={arcColor}>
          {/* No picto for this step: the dial stays empty, never the raw emoji. */}
          {seq && stepPicto ? <Picto name={stepPicto} size={STEP_PICTO_SIZE} /> : null}
          {showEgg ? (
            <HatchingEgg
              progress={progress}
              wobbling={running && almostDone}
              hatched={revealed?.id ?? null}
              hatchedLabel={revealed?.name}
              eggLabel={copy.eggLabel}
              size={EGG_SIZE}
            />
          ) : null}
        </TimerDial>
      </View>
      <View style={styles.timeBlock}>
        <Text style={styles.time}>{fmt(remainingSec)}</Text>
        <Text style={styles.status}>{statusText}</Text>
      </View>

      {/* Mō, one per screen: guide during a routine, waiting with the child
          during the free timer, clapping once the companion has hatched. */}
      {seq ? (
        <MoSays state="guide" size={MO_SIZE} text={mo.justThisOne} moSide="left" />
      ) : revealed ? (
        <MoSays state="bravo" size={MO_SIZE} text={mo.bravo} moSide="right" />
      ) : (
        <MoSays state="veille" size={MO_SIZE} text={mo.waitTogether} moSide="right" breathe />
      )}

      {/* Companion reveal — free mode */}
      {revealed && !seq ? (
        <CalloutCard variant="success" label={revealNew ? copy.companionNew : copy.companionAgain}>
          <Text style={styles.revealName}>{revealed.name}</Text>
          <Pressable onPress={goCollection} accessibilityRole="button" style={styles.linkHit}>
            <Text style={styles.collectionLink}>{copy.viewCollection} ›</Text>
          </Pressable>
        </CalloutCard>
      ) : null}

      {/* Primary control */}
      {stepCompleted && seq ? (
        <Button
          label={stepIndex >= seq.steps.length - 1 ? copy.sequenceFinished : copy.nextStep}
          icon={<ChevronRight size={18} color={c.onPrimary} />}
          onPress={nextStep}
        />
      ) : (
        <Button
          label={running ? copy.pause : remainingSec < durationSec ? copy.resume : copy.start}
          icon={running ? <Pause size={20} color={c.onPrimary} fill={c.onPrimary} /> : <Play size={20} color={c.onPrimary} fill={c.onPrimary} />}
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
      minHeight: 44,
      justifyContent: "center",
    },
    chipOn: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.subtext, fontFamily: fonts.medium, fontSize: 14 },
    chipTextOn: { color: c.onPrimary, fontFamily: fonts.semibold },
    dialWrap: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 12,
      width: DIAL_SIZE,
      height: DIAL_SIZE,
      alignSelf: "center",
    },
    timeBlock: { alignItems: "center", gap: 2 },
    time: { fontSize: 56, color: c.text, fontFamily: fonts.bold, fontVariant: ["tabular-nums"] },
    status: { fontSize: 14, color: c.muted, fontFamily: fonts.medium },
    speedRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      alignSelf: "center",
      paddingHorizontal: 14,
      paddingVertical: 8,
      minHeight: 44,
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
    finishScene: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 4 },
    finishTitle: { fontSize: 24, color: c.text, fontFamily: fonts.heading, letterSpacing: -0.6, textAlign: "center" },
    revealName: { fontSize: 16, color: c.text, fontFamily: fonts.semibold, textAlign: "center" },
    companionRowOn: { backgroundColor: c.infoSurface, borderColor: c.infoBorder },
    companionTextOn: { color: c.infoFg, fontFamily: fonts.semibold },
    collectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 8,
      minHeight: 44,
    },
    linkHit: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
    collectionLink: { color: c.brandStrong, fontFamily: fonts.semibold, fontSize: 14 },
  });
