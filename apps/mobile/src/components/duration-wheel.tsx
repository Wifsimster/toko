import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityActionEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  TIMER_MINUTE_VALUES,
  TIMER_SECOND_VALUES,
  composeTimerDuration,
  splitTimerDuration,
} from "@focusflow/validators";

import { fonts } from "./ui";
import { timer as copy } from "../lib/copy";
import { useReduceMotion } from "../lib/reduce-motion";
import { useTheme, type Palette } from "../lib/theme";

export type WheelSize = "sm" | "md" | "lg";
const SIZES: Record<WheelSize, { rows: 3 | 5; row: number; font: number }> = {
  sm: { rows: 3, row: 48, font: 38 },
  md: { rows: 5, row: 48, font: 40 },
  lg: { rows: 5, row: 56, font: 46 },
};
const UNITS_H = 22;

export function wheelSizeFor(height: number): WheelSize {
  if (height >= SIZES.lg.rows * SIZES.lg.row + UNITS_H) return "lg";
  if (height >= SIZES.md.rows * SIZES.md.row + UNITS_H) return "md";
  return "sm";
}
const SETTLE_MS = 180;

const pad2 = (n: number) => String(n).padStart(2, "0");

export function DurationWheel({
  value,
  onChange,
  size,
}: {
  value: number;
  onChange: (sec: number) => void;
  size: WheelSize;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { minutes, seconds } = splitTimerDuration(value);
  const { rows, row: rowH, font } = SIZES[size];

  return (
    <View style={s.wrap}>
      <View style={s.units} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Text style={s.unit}>{copy.wheelMinutesShort}</Text>
        <View style={s.colonSpace} />
        <Text style={s.unit}>{copy.wheelSecondsShort}</Text>
      </View>
      <View style={[s.columns, { height: rowH * rows }]}>
        <View style={[s.band, { top: rowH * ((rows - 1) / 2), height: rowH }]} pointerEvents="none" />
        <WheelColumn
          values={TIMER_MINUTE_VALUES}
          value={minutes}
          onChange={(m) => onChange(composeTimerDuration(m, seconds))}
          rows={rows}
          row={rowH}
          font={font}
          label={copy.wheelMinutesLabel}
          spoken={copy.wheelMinutesValue}
        />
        <Text style={[s.colon, { fontSize: font - 6 }]} importantForAccessibility="no" accessibilityElementsHidden>
          :
        </Text>
        <WheelColumn
          values={TIMER_SECOND_VALUES}
          value={seconds}
          onChange={(sec) => onChange(composeTimerDuration(minutes, sec))}
          rows={rows}
          row={rowH}
          font={font}
          label={copy.wheelSecondsLabel}
          spoken={copy.wheelSecondsValue}
        />
      </View>
    </View>
  );
}

function WheelColumn({
  values,
  value,
  onChange,
  rows,
  row: rowH,
  font,
  label,
  spoken,
}: {
  values: readonly number[];
  value: number;
  onChange: (v: number) => void;
  rows: 3 | 5;
  row: number;
  font: number;
  label: string;
  spoken: (v: number) => string;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const reduceMotion = useReduceMotion();

  const index = Math.max(0, values.indexOf(value));
  const last = values.length - 1;
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(index * rowH)).current;
  const liveIndex = useRef(index);
  const settledIndex = useRef(index);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmatic = useRef(false);
  const latest = useRef({ values, value, onChange });
  latest.current = { values, value, onChange };

  useEffect(() => {
    if (index === settledIndex.current) return;
    settledIndex.current = index;
    liveIndex.current = index;
    programmatic.current = !reduceMotion;
    scrollRef.current?.scrollTo({ y: index * rowH, animated: !reduceMotion });
  }, [index, reduceMotion, rowH]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: settledIndex.current * rowH, animated: false });
  }, [rowH]);

  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    [],
  );

  const clampIndex = (y: number) => Math.min(last, Math.max(0, Math.round(y / rowH)));

  const settle = (y: number) => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    programmatic.current = false;
    const i = clampIndex(y);
    settledIndex.current = i;
    if (Math.abs(y - i * rowH) > 1) {
      scrollRef.current?.scrollTo({ y: i * rowH, animated: !reduceMotion });
    }
    const { values: vs, value: current, onChange: emit } = latest.current;
    if (vs[i] !== current) emit(vs[i]!);
  };

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const i = clampIndex(y);
      if (i !== liveIndex.current) {
        liveIndex.current = i;
        if (!programmatic.current) Haptics.selectionAsync().catch(() => {});
      }
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => settle(y), SETTLE_MS);
    },
  });

  const goTo = (i: number) => {
    const next = Math.min(last, Math.max(0, i));
    if (next === settledIndex.current) return;
    onChange(values[next]!);
  };

  const onAction = (e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName === "increment") goTo(settledIndex.current + 1);
    if (e.nativeEvent.actionName === "decrement") goTo(settledIndex.current - 1);
  };

  const padding = rowH * ((rows - 1) / 2);

  return (
    <View
      style={[s.column, { height: rowH * rows }]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: spoken(value) }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={onAction}
    >
      <Animated.ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={rowH}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: index * rowH }}
        contentContainerStyle={{ paddingVertical: padding }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => settle(e.nativeEvent.contentOffset.y)}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {values.map((v, i) => {
          const range = [(i - 2) * rowH, (i - 1) * rowH, i * rowH, (i + 1) * rowH, (i + 2) * rowH];
          const opacity = scrollY.interpolate({
            inputRange: range,
            outputRange: [0.18, 0.42, 1, 0.42, 0.18],
            extrapolate: "clamp",
          });
          const scale = scrollY.interpolate({
            inputRange: range,
            outputRange: [0.62, 0.72, 1, 0.72, 0.62],
            extrapolate: "clamp",
          });
          return (
            <Pressable key={v} onPress={() => goTo(i)} style={[s.row, { height: rowH }]}>
              <Animated.Text
                maxFontSizeMultiplier={1.15}
                style={[s.digit, { fontSize: font, lineHeight: rowH, opacity, transform: [{ scale }] }]}
              >{pad2(v)}</Animated.Text>
            </Pressable>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { alignItems: "center", gap: 2 },
    units: { flexDirection: "row", alignItems: "center", height: UNITS_H },
    unit: {
      width: 96,
      textAlign: "center",
      fontSize: 13,
      color: c.muted,
      fontFamily: fonts.medium,
    },
    colonSpace: { width: 24 },
    columns: { flexDirection: "row", alignItems: "center" },
    band: {
      position: "absolute",
      left: 0,
      right: 0,
      borderRadius: 14,
      backgroundColor: c.mutedSurface,
    },
    column: { width: 96, overflow: "hidden" },
    row: { alignItems: "center", justifyContent: "center" },
    digit: {
      color: c.text,
      fontFamily: fonts.bold,
      fontVariant: ["tabular-nums"],
    },
    colon: {
      width: 24,
      textAlign: "center",
      color: c.text,
      fontFamily: fonts.bold,
      marginTop: -4,
    },
  });
