import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { ChevronRight, Pause, PawPrint, Play, RotateCcw } from "lucide-react-native";

import { Button, Screen, ScreenHeader, fonts } from "../components/ui";
import { DurationWheel, wheelSizeFor } from "../components/duration-wheel";
import { HatchingEgg } from "../components/hatching-egg";
import { MoSays } from "../components/mo/mo-says";
import { Picto } from "../components/mo/companion";
import { TimerDial } from "../components/timer-dial";
import { mo, timer as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import { useTheme, type Palette } from "../lib/theme";
import { useActiveChild } from "../lib/active-child";
import { useLastTimerDuration } from "../lib/last-timer-duration";
import { pickCritter, type Critter } from "../lib/critters";
import { pictoForStep } from "../lib/icon-for";
import { useCompleteStep } from "../hooks/use-routines";
import { useRecordCompanion } from "../hooks/use-companions";
import type { TimerProps } from "../navigation/types";
import { backIfPushed } from "../navigation/tabs";

const QUICK_MINUTES = [2, 5, 10] as const;
const ALMOST_DONE_SEC = 10;
const VIBRATION_PATTERN = [0, 400, 200, 400, 200, 600];

const DIAL_MAX = 340;
const DIAL_MIN = 150;
const CENTER_RATIO = 0.44;
const DESCRIPTION_MIN_H = 700;
const MO_MIN_H = 540;
const MO_SIZE = 56;

function fmt(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TimerScreen({ navigation, route }: TimerProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const window = useWindowDimensions();

  const seq = route.params?.sequence;
  const completeStep = useCompleteStep();

  const activeChild = useActiveChild().active;
  const childId = seq?.childId ?? activeChild?.id ?? "";
  const childName = activeChild?.name ?? "";
  const recordCompanion = useRecordCompanion(childId);

  const finishSound = useAudioPlayer(require("../../assets/timer-done.wav"));
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const [revealed, setRevealed] = useState<Critter | null>(null);
  const [revealNew, setRevealNew] = useState<boolean | undefined>(undefined);
  const revealedRef = useRef(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const seqStep = seq?.steps[stepIndex];

  const lastDuration = useLastTimerDuration();
  const [durationSec, setDurationSec] = useState(seqStep?.durationSec ?? 0);
  const [remainingSec, setRemainingSec] = useState(seqStep?.durationSec ?? 0);
  const [wheelReady, setWheelReady] = useState(false);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (seq || wheelReady || lastDuration.initial === undefined) return;
    setDurationSec(lastDuration.initial);
    setRemainingSec(lastDuration.initial);
    setWheelReady(true);
  }, [seq, wheelReady, lastDuration.initial]);

  const [columnH, setColumnH] = useState(0);
  const [slot, setSlot] = useState({ w: 0, h: 0 });
  const onColumnLayout = (e: LayoutChangeEvent) => setColumnH(Math.round(e.nativeEvent.layout.height));
  const onSlotLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSlot({ w: Math.floor(width), h: Math.floor(height) });
  };
  const measured = columnH > 0;
  const showDescription = !seq && measured && columnH >= DESCRIPTION_MIN_H;
  const showMo = measured && columnH >= MO_MIN_H;
  const dialSize = Math.max(
    DIAL_MIN,
    Math.min(DIAL_MAX, window.width - 40, slot.w || DIAL_MAX, slot.h || DIAL_MAX),
  );
  const wheelSize = wheelSizeFor(slot.h);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

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
  }, [running, clear, seq, finishStep, finishSound]);

  const isFinished = durationSec > 0 && remainingSec === 0;
  const setup = !seq && !running && remainingSec === durationSec && !revealed;
  const almostDone = running && remainingSec > 0 && remainingSec <= ALMOST_DONE_SEC;
  const progress = durationSec > 0 ? remainingSec / durationSec : 0;
  const stepCompleted = !!seq && isFinished;

  function clearReveal() {
    revealedRef.current = false;
    setRevealed(null);
    setRevealNew(undefined);
  }

  function selectDuration(sec: number) {
    setDurationSec(sec);
    setRemainingSec(sec);
  }

  function start() {
    if (durationSec <= 0) return;
    if (!seq) lastDuration.remember(durationSec);
    clearReveal();
    setRemainingSec(durationSec);
    setRunning(true);
  }

  function toggleRun() {
    if (running) {
      setRunning(false);
    } else if ((isFinished && !seq) || remainingSec === durationSec) {
      start();
    } else {
      setRunning(true);
    }
  }

  function reset() {
    clear();
    setRunning(false);
    setRemainingSec(durationSec);
    clearReveal();
  }

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

  const arcColor = isFinished ? c.success : almostDone ? c.danger : c.brand;
  const stepPicto = seqStep ? pictoForStep(seqStep.label, seqStep.emoji) : undefined;

  useEffect(() => {
    const done = seq ? finished : isFinished;
    if (!done || revealedRef.current) return;
    revealedRef.current = true;
    const cr = pickCritter();
    setRevealed(cr);
    if (!childId) return;
    recordCompanion.mutate(
      { childId, animalId: cr.id },
      { onSuccess: (data) => setRevealNew(!data.alreadyDiscovered) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq, finished, isFinished, childId]);

  const goCollection = () =>
    navigation.navigate("CompanionCollection", { childId, childName });

  if (seq && finished) {
    return (
      <Screen fit>
        <ScreenHeader title={seq.name} onBack={() => navigation.goBack()} />
        <View style={styles.finishWrap}>
          <Text style={styles.finishTitle}>{copy.sequenceFinished}</Text>
          {revealed ? (
            <>
              <View style={styles.finishScene}>
                <MoSays state="bravo" size={96} text={mo.bravo} moSide="below" />
                <HatchingEgg progress={0} wobbling={false} hatched={revealed.id} hatchedLabel={revealed.name} size={160} />
              </View>
              <Text style={styles.revealName}>
                {revealNew === false ? copy.companionAgain : copy.companionNew} {revealed.name}
              </Text>
              <Button label={copy.viewCollection} onPress={goCollection} />
            </>
          ) : (
            <MoSays state="bravo" size={112} text={mo.bravo} moSide="below" />
          )}
          <Button label={copy.quitSequence} variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
  }

  const statusText = seq
    ? copy.stepCounter(stepIndex + 1, seq.steps.length)
    : isFinished
      ? revealed
        ? copy.companionHatched(revealed.name, revealNew)
        : copy.finished
      : almostDone
        ? copy.almostDone
        : running
          ? copy.running
          : copy.paused;

  const centerSize = Math.round(dialSize * CENTER_RATIO);

  const collectionLink = childId && !seq ? (
    <Pressable
      onPress={goCollection}
      style={styles.collectionHit}
      accessibilityRole="button"
      accessibilityLabel={copy.viewCollection}
    >
      <PawPrint size={18} color={c.brandStrong} />
      <Text style={styles.collectionText}>{copy.collectionShort}</Text>
    </Pressable>
  ) : undefined;

  return (
    <Screen fit dense>
      <View style={styles.column} onLayout={onColumnLayout}>
        <ScreenHeader
          title={seq ? seq.name : copy.title}
          subtitle={seq ? seqStep?.label : undefined}
          onBack={seq ? () => navigation.goBack() : backIfPushed(navigation)}
          right={collectionLink}
        />
        {showDescription ? <Text style={styles.subtitle}>{copy.subtitle}</Text> : null}

        <View style={styles.slot} onLayout={onSlotLayout}>
          {!measured ? null : setup ? (
            wheelReady ? (
              <DurationWheel value={durationSec} onChange={selectDuration} size={wheelSize} />
            ) : null
          ) : (
            <TimerDial size={dialSize} progress={progress} color={arcColor}>
              {seq && stepPicto ? <Picto name={stepPicto} size={centerSize} /> : null}
              {!seq ? (
                <HatchingEgg
                  progress={progress}
                  wobbling={running && almostDone}
                  hatched={revealed?.id ?? null}
                  hatchedLabel={revealed?.name}
                  eggLabel={copy.eggLabel}
                  size={centerSize}
                />
              ) : null}
            </TimerDial>
          )}
        </View>

        <View style={styles.block}>
          {setup ? (
            <>
              <View style={styles.presets} accessibilityRole="radiogroup" accessibilityLabel={copy.presetsLabel}>
                {QUICK_MINUTES.map((m) => {
                  const sec = m * 60;
                  const on = durationSec === sec;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => selectDuration(sec)}
                      style={[styles.chip, on && styles.chipOn]}
                      accessibilityRole="radio"
                      accessibilityLabel={copy.presetLabel(m)}
                      accessibilityState={{ checked: on }}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{copy.minutesLabel(m)}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.status}>{durationSec > 0 ? copy.ready : copy.chooseDuration}</Text>
            </>
          ) : (
            <>
              <Text
                style={styles.time}
                maxFontSizeMultiplier={1.2}
                accessibilityLabel={copy.spokenTime(remainingSec)}
              >
                {fmt(remainingSec)}
              </Text>
              <Text style={styles.status} numberOfLines={1}>
                {statusText}
              </Text>
            </>
          )}
        </View>

        {showMo ? (
          seq ? (
            <MoSays state="guide" size={MO_SIZE} text={mo.justThisOne} moSide="left" compact />
          ) : revealed ? (
            <MoSays state="bravo" size={MO_SIZE} text={mo.bravo} moSide="right" compact />
          ) : (
            <MoSays state="veille" size={MO_SIZE} text={mo.waitTogether} moSide="right" compact breathe />
          )
        ) : null}

        <View style={styles.controls}>
          {seq ? (
            <Button
              label={copy.quitSequence}
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.controlHalf}
            />
          ) : !setup ? (
            <Button
              label={copy.reset}
              variant="secondary"
              icon={<RotateCcw size={18} color={c.text} />}
              onPress={reset}
              style={styles.controlHalf}
            />
          ) : null}
          {stepCompleted && seq ? (
            <Button
              label={stepIndex >= seq.steps.length - 1 ? copy.sequenceFinished : copy.nextStep}
              icon={<ChevronRight size={18} color={c.onPrimary} />}
              onPress={nextStep}
              style={styles.controlHalf}
            />
          ) : (
            <Button
              label={
                running
                  ? copy.pause
                  : isFinished && !seq
                    ? copy.restart
                    : remainingSec < durationSec
                      ? copy.resume
                      : copy.start
              }
              icon={
                running ? (
                  <Pause size={20} color={c.onPrimary} fill={c.onPrimary} />
                ) : (
                  <Play size={20} color={c.onPrimary} fill={c.onPrimary} />
                )
              }
              onPress={toggleRun}
              disabled={durationSec <= 0}
              style={styles.controlHalf}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    column: { flexGrow: 1, gap: 12 },
    subtitle: { fontSize: 14, color: c.muted, fontFamily: fonts.body, lineHeight: 20, marginTop: -4 },
    slot: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minHeight: DIAL_MIN,
      alignItems: "center",
      justifyContent: "center",
    },
    block: { height: 84, alignItems: "center", justifyContent: "center", gap: 6 },
    presets: { flexDirection: "row", justifyContent: "center", gap: 8 },
    chip: {
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      minHeight: 48,
      minWidth: 76,
      alignItems: "center",
      justifyContent: "center",
    },
    chipOn: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.subtext, fontFamily: fonts.medium, fontSize: 15 },
    chipTextOn: { color: c.onPrimary, fontFamily: fonts.semibold },
    time: { fontSize: 48, lineHeight: 56, color: c.text, fontFamily: fonts.bold, fontVariant: ["tabular-nums"] },
    status: { fontSize: 14, color: c.muted, fontFamily: fonts.medium, textAlign: "center" },
    controls: { flexDirection: "row", gap: 10 },
    controlHalf: { flex: 1, paddingHorizontal: 12 },
    collectionHit: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 44,
      paddingLeft: 8,
    },
    collectionText: { color: c.brandStrong, fontFamily: fonts.semibold, fontSize: 14 },
    finishWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
    finishScene: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 4 },
    finishTitle: { fontSize: 24, color: c.text, fontFamily: fonts.heading, letterSpacing: -0.6, textAlign: "center" },
    revealName: { fontSize: 16, color: c.text, fontFamily: fonts.semibold, textAlign: "center" },
  });
