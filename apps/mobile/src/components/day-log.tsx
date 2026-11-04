import { useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, History } from "lucide-react-native";
import { dayLevelOf, type DayLevel, type Symptom } from "@focusflow/validators";

import { Button, ErrorNote, fonts } from "./ui";
import { MoodFace } from "./mo/mood-face";
import { dayLog as copy } from "../lib/copy";
import { DAY_CHOICES, type DayChoice, type WeekPill } from "../lib/day-log";
import { useTheme, type Palette } from "../lib/theme";

const TILE_MO_SIZE = 40;

const CHOICE_LABEL: Record<DayChoice, string> = {
  calm: copy.calm,
  typical: copy.typical,
  tough: copy.tough,
};

const LEVEL_LABEL: Record<DayLevel, string> = {
  good: copy.calm,
  ok: copy.typical,
  hard: copy.tough,
};

export function levelSurface(level: DayLevel, c: Palette): string {
  if (level === "good") return c.surfaceMint;
  if (level === "hard") return c.surfacePeach;
  return c.mutedSurface;
}

function choiceSurface(choice: DayChoice, c: Palette): string {
  if (choice === "calm") return c.surfaceMint;
  if (choice === "tough") return c.surfacePeach;
  return c.mutedSurface;
}

function ChoiceArt({ choice, color }: { choice: DayChoice; color: string }): ReactNode {
  if (choice === "calm") return <MoodFace state="calme" size={TILE_MO_SIZE} />;
  if (choice === "tough") return <MoodFace state="trop-plein" size={TILE_MO_SIZE} />;
  return <History size={30} color={color} />;
}

export function TodayPanel({
  todayEntry,
  choice,
  onChoose,
  onSave,
  onRefine,
  onEdit,
  saving,
  error,
}: {
  todayEntry: Symptom | null;
  choice: DayChoice | null;
  onChoose: (choice: DayChoice) => void;
  onSave: () => void;
  onRefine: () => void;
  onEdit: () => void;
  saving: boolean;
  error: boolean;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);

  if (todayEntry) {
    const level = dayLevelOf(todayEntry);
    return (
      <View style={s.panel}>
        <View style={[s.doneTile, { backgroundColor: levelSurface(level, c) }]}>
          <Text style={s.doneLevel}>{LEVEL_LABEL[level]}</Text>
          <Text style={s.doneText}>{copy.done}</Text>
        </View>
        <Button label={copy.edit} variant="secondary" onPress={onEdit} style={s.editBtn} />
      </View>
    );
  }

  return (
    <View style={s.panel}>
      <Text style={s.question}>{copy.question}</Text>
      <View style={s.tiles} accessibilityRole="radiogroup" accessibilityLabel={copy.question}>
        {DAY_CHOICES.map((key) => {
          const on = choice === key;
          return (
            <Pressable
              key={key}
              onPress={() => onChoose(key)}
              style={[s.tile, { backgroundColor: choiceSurface(key, c) }, on && s.tileOn]}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={CHOICE_LABEL[key]}
            >
              {on ? (
                <View style={s.check}>
                  <Check size={14} color={c.onPrimary} />
                </View>
              ) : null}
              <ChoiceArt choice={key} color={c.text} />
              <Text style={s.tileLabel}>{CHOICE_LABEL[key]}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <ErrorNote message={copy.error} /> : null}
      <Button label={copy.save} onPress={onSave} disabled={!choice} loading={saving} />
      <Pressable onPress={onRefine} style={s.refineHit} accessibilityRole="button">
        <Text style={s.refine}>{copy.refine}</Text>
      </Pressable>
    </View>
  );
}

export function WeekCard({ pills }: { pills: WeekPill[] }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.week}>
      <Text style={s.weekTitle}>{copy.week}</Text>
      <View style={s.pills}>
        {pills.map((p) => (
          <View
            key={p.iso}
            style={s.pillCol}
            accessible
            accessibilityRole="text"
            accessibilityLabel={p.accessibilityLabel}
          >
            <Text style={[s.pillDay, p.isToday && s.pillDayToday]}>{p.initial}</Text>
            <View
              style={[
                s.pill,
                p.level
                  ? { backgroundColor: levelSurface(p.level, c) }
                  : [s.pillEmpty, p.isFuture && s.pillFuture],
              ]}
            />
          </View>
        ))}
      </View>
      <View style={s.legend} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <LegendItem color={c.surfaceMint} label={copy.legendCalm} />
        <LegendItem color={c.mutedSurface} label={copy.legendTypical} />
        <LegendItem color={c.surfacePeach} label={copy.legendTough} />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={s.legendText}>{label}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    panel: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 20,
      padding: 16,
      gap: 12,
    },
    question: { fontSize: 17, color: c.text, fontFamily: fonts.semibold },
    tiles: { flexDirection: "row", gap: 10 },
    tile: {
      flex: 1,
      minHeight: 112,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 6,
    },
    tileOn: { borderColor: c.text },
    check: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: c.text,
      alignItems: "center",
      justifyContent: "center",
    },
    tileLabel: { fontSize: 14, color: c.text, fontFamily: fonts.semibold, textAlign: "center" },
    refineHit: { minHeight: 44, justifyContent: "center", alignItems: "center" },
    refine: { color: c.brandStrong, fontSize: 15, fontFamily: fonts.medium },
    doneTile: { borderRadius: 18, padding: 18, gap: 4, minHeight: 88, justifyContent: "center" },
    doneLevel: { fontSize: 18, color: c.text, fontFamily: fonts.bold },
    doneText: { fontSize: 15, color: c.text, fontFamily: fonts.body },
    editBtn: { borderColor: c.text },
    week: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 20,
      padding: 16,
      gap: 12,
    },
    weekTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    pills: { flexDirection: "row", justifyContent: "space-between" },
    pillCol: { alignItems: "center", gap: 6, minWidth: 36 },
    pillDay: { fontSize: 13, color: c.muted, fontFamily: fonts.medium },
    pillDayToday: { color: c.text, fontFamily: fonts.bold },
    pill: { width: 30, height: 30, borderRadius: 9 },
    pillEmpty: { borderWidth: 1.5, borderStyle: "dashed", borderColor: c.chevron },
    pillFuture: { opacity: 0.45 },
    legend: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 12, height: 12, borderRadius: 4 },
    legendText: { fontSize: 12, color: c.muted, fontFamily: fonts.body },
  });
