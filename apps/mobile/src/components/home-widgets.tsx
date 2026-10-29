import { useMemo, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react-native";
import type { HomeRoutine } from "@focusflow/validators";

import { fonts } from "./ui";
import { ItemIcon } from "./item-icon";
import { MoodFace, PARENT_MOODS } from "./mo/mood-face";
import { home as copy, TIME_OF_DAY_LABELS } from "../lib/copy";
import { todayISO } from "../lib/date";
import { iconFor } from "../lib/icon-for";
import { useActiveChild } from "../lib/active-child";
import { useReduceMotion } from "../lib/reduce-motion";
import { useTheme, type Palette } from "../lib/theme";
import {
  useLogMedication,
  useMedicationAdherence,
  type MedicationAdherence,
} from "../hooks/use-medications";

function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const reduceMotion = useReduceMotion();
  return (
    <Modal
      visible={open}
      transparent
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onClose}
    >
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <View style={s.sheetHead}>
            <Text style={s.sheetTitle} accessibilityRole="header">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              style={s.sheetClose}
              accessibilityRole="button"
              accessibilityLabel={copy.close}
            >
              <X size={22} color={c.text} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function ChildPill() {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { children, active, setActiveChildId } = useActiveChild();
  const [open, setOpen] = useState(false);
  if (!active) return null;
  const canSwitch = children.length > 1;
  const initial = active.name.trim().charAt(0).toLocaleUpperCase("fr-FR");

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={!canSwitch}
        style={s.pill}
        accessibilityRole={canSwitch ? "button" : "text"}
        accessibilityLabel={canSwitch ? copy.childChip(active.name) : active.name}
      >
        <View style={s.pillDisc}>
          <Text style={s.pillInitial}>{initial}</Text>
        </View>
        <Text style={s.pillName} numberOfLines={1}>
          {active.name}
        </Text>
        {canSwitch ? <ChevronDown size={18} color={c.text} /> : null}
      </Pressable>
      {canSwitch ? (
        <Sheet open={open} title={copy.switchChild} onClose={() => setOpen(false)}>
          {children.map((ch) => {
            const on = ch.id === active.id;
            return (
              <Pressable
                key={ch.id}
                onPress={() => {
                  setActiveChildId(ch.id);
                  setOpen(false);
                }}
                style={[s.choice, on && s.choiceOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={s.choiceText}>{ch.name}</Text>
                {on ? <Check size={18} color={c.brandStrong} /> : null}
              </Pressable>
            );
          })}
        </Sheet>
      ) : null}
    </>
  );
}

export function MoodPicker({
  todaysScore,
  onPick,
}: {
  todaysScore: number | undefined;
  onPick: (score: number) => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const [editing, setEditing] = useState(false);
  const saved = PARENT_MOODS.find((m) => m.score === todaysScore);

  if (saved && !editing) {
    return (
      <Pressable
        onPress={() => setEditing(true)}
        style={s.moodLine}
        accessibilityRole="button"
        accessibilityLabel={copy.moodEditLabel(saved.label)}
      >
        <Text style={s.moodLineText} numberOfLines={1}>
          {copy.moodToday}
          <Text style={s.moodLineValue}>{saved.label}</Text>
        </Text>
        <Text style={s.moodEdit}>{copy.moodEdit}</Text>
      </Pressable>
    );
  }

  return (
    <View style={s.moodBlock}>
      <Text style={s.moodQuestion} accessibilityRole="header">
        {copy.moodQuestion}
      </Text>
      <View style={s.moodRow}>
        {PARENT_MOODS.map((m) => {
          const on = m.score === todaysScore;
          return (
            <Pressable
              key={m.score}
              accessibilityRole="button"
              accessibilityLabel={m.label}
              accessibilityState={{ selected: on }}
              style={[s.moodBtn, on && s.moodBtnOn]}
              onPress={() => {
                onPick(m.score);
                setEditing(false);
              }}
            >
              <MoodFace state={m.state} size={34} />
              <Text style={s.moodLabel} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function TakenButtons({
  med,
  onSet,
}: {
  med: MedicationAdherence;
  onSet: (taken: boolean) => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const taken = med.todayTaken === true;
  const missed = med.todayTaken === false;
  return (
    <View style={s.takenRow}>
      <Pressable
        onPress={() => onSet(true)}
        style={[s.takenBtn, taken && s.takenBtnOn]}
        accessibilityRole="button"
        accessibilityLabel={`${med.name} ${copy.taken}`}
        accessibilityState={{ selected: taken }}
      >
        {taken ? <Check size={14} color={c.onPrimary} /> : null}
        <Text style={[s.takenText, taken && s.takenTextOn]}>{copy.taken}</Text>
      </Pressable>
      <Pressable
        onPress={() => onSet(false)}
        style={[s.takenBtn, missed && s.takenBtnOn]}
        accessibilityRole="button"
        accessibilityLabel={`${med.name} ${copy.missed}`}
        accessibilityState={{ selected: missed }}
      >
        {missed ? <Check size={14} color={c.onPrimary} /> : null}
        <Text style={[s.takenText, missed && s.takenTextOn]}>{copy.missed}</Text>
      </Pressable>
    </View>
  );
}

export function MedicationsRow({ childId }: { childId: string }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { data } = useMedicationAdherence(childId);
  const log = useLogMedication(childId);
  const [open, setOpen] = useState(false);
  const meds = data?.medications ?? [];
  if (meds.length === 0) return null;

  const set = (medicationId: string, taken: boolean) =>
    log.mutate({ medicationId, date: todayISO(), taken });

  if (meds.length === 1) {
    const med = meds[0];
    return (
      <View style={s.row}>
        <View style={s.rowBody}>
          <Text style={s.rowTitle} numberOfLines={2}>
            {med.name}
          </Text>
          <Text style={s.rowMeta} numberOfLines={1}>
            {copy.medsSubtitle}
          </Text>
        </View>
        <TakenButtons med={med} onSet={(taken) => set(med.id, taken)} />
      </View>
    );
  }

  const taken = meds.filter((m) => m.todayTaken === true).length;
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={s.row}
        accessibilityRole="button"
      >
        <View style={s.rowBody}>
          <Text style={s.rowTitle} numberOfLines={1}>
            {copy.medsSummary(taken, meds.length)}
          </Text>
          <Text style={s.rowMeta} numberOfLines={1}>
            {copy.medsSubtitle}
          </Text>
        </View>
        <ChevronRight size={20} color={c.chevron} />
      </Pressable>
      <Sheet open={open} title={copy.medsSheetTitle} onClose={() => setOpen(false)}>
        {meds.map((m) => (
          <View key={m.id} style={s.sheetRow}>
            <Text style={[s.rowTitle, s.rowBody]}>{m.name}</Text>
            <TakenButtons med={m} onSet={(t) => set(m.id, t)} />
          </View>
        ))}
      </Sheet>
    </>
  );
}

export function RoutineRow({
  routine,
  onPress,
}: {
  routine: HomeRoutine;
  onPress: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <Pressable onPress={onPress} style={s.row} accessibilityRole="button">
      <View style={s.rowIcon}>
        <ItemIcon
          spec={iconFor({ label: routine.name, emoji: routine.emoji, kind: "routine" })}
          size={28}
          fallback={routine.name}
        />
      </View>
      <View style={s.rowBody}>
        <Text style={s.rowTitle} numberOfLines={1}>
          {routine.name}
        </Text>
        <Text style={s.rowMeta} numberOfLines={1}>
          {copy.routineMeta(
            TIME_OF_DAY_LABELS[routine.timeOfDay] ?? "",
            routine.stepCount - routine.doneCount,
          )}
        </Text>
      </View>
      <ChevronRight size={20} color={c.chevron} />
    </Pressable>
  );
}

export function WeekLine({
  streak,
  stars,
  calmMinutes,
  onPress,
}: {
  streak: number | undefined;
  stars: number | undefined;
  calmMinutes: number | undefined;
  onPress: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const parts = [
    streak ? { n: streak, text: copy.weekStreak(streak) } : null,
    stars ? { n: stars, text: copy.weekStars(stars) } : null,
    calmMinutes ? { n: calmMinutes, text: copy.weekCalm(calmMinutes) } : null,
  ]
    .filter((p): p is { n: number; text: string } => p !== null)
    .filter((p, i, all) => {
      const len = [copy.weekTitle, ...all.slice(0, i + 1).map((x) => x.text)].join(" · ").length;
      return i === 0 || len <= WEEK_LINE_CHARS;
    });

  return (
    <Pressable
      onPress={onPress}
      style={[s.row, s.weekRow]}
      accessibilityRole="button"
      accessibilityLabel={[copy.weekTitle, ...parts.map((p) => p.text), copy.weekLabel].join(", ")}
    >
      <Text style={[s.rowBody, s.weekText]} numberOfLines={2}>
        <Text style={s.weekTitle}>{copy.weekTitle}</Text>
        {parts.map((p) => {
          const rest = p.text.slice(String(p.n).length);
          return (
            <Text key={p.text}>
              {" · "}
              <Text style={s.weekNumber}>{p.n}</Text>
              {rest}
            </Text>
          );
        })}
      </Text>
      <ChevronRight size={20} color={c.chevron} />
    </Pressable>
  );
}

const WEEK_LINE_CHARS = 34;

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(30, 42, 46, 0.4)",
      justifyContent: "center",
      padding: 20,
    },
    sheet: { backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 10 },
    sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sheetTitle: { fontSize: 17, color: c.text, fontFamily: fonts.semibold },
    sheetClose: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginRight: -10,
    },
    sheetRow: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48 },
    choice: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 48,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    choiceOn: { borderColor: c.primary, borderWidth: 1.5 },
    choiceText: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 44,
      maxWidth: 170,
      paddingLeft: 5,
      paddingRight: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    pillDisc: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: c.surfaceHoney,
      alignItems: "center",
      justifyContent: "center",
    },
    pillInitial: { fontSize: 14, color: c.text, fontFamily: fonts.bold },
    pillName: { flexShrink: 1, fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    moodBlock: { gap: 8 },
    moodQuestion: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    moodRow: { flexDirection: "row", gap: 5 },
    moodBtn: {
      flex: 1,
      minHeight: 62,
      paddingVertical: 5,
      paddingHorizontal: 2,
      borderRadius: 14,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    moodBtnOn: { borderColor: c.primary, borderWidth: 1.5 },
    moodLabel: { fontSize: 11, color: c.subtext, fontFamily: fonts.medium, textAlign: "center" },
    moodLine: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 44,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    moodLineText: { flex: 1, fontSize: 14, color: c.muted, fontFamily: fonts.body },
    moodLineValue: { color: c.text, fontFamily: fonts.semibold },
    moodEdit: { fontSize: 14, color: c.brandStrong, fontFamily: fonts.semibold },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minHeight: 56,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    rowBody: { flex: 1 },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.surfaceSky,
      alignItems: "center",
      justifyContent: "center",
    },
    rowTitle: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    rowMeta: { fontSize: 13, color: c.muted, fontFamily: fonts.body },
    takenRow: { flexDirection: "row", gap: 6 },
    takenBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      minHeight: 44,
      minWidth: 60,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    takenBtnOn: { backgroundColor: c.primary, borderColor: c.primary },
    takenText: { fontSize: 14, color: c.text, fontFamily: fonts.semibold },
    takenTextOn: { color: c.onPrimary },
    weekRow: { minHeight: 48 },
    weekText: { fontSize: 14, color: c.text, fontFamily: fonts.body },
    weekTitle: { fontFamily: fonts.semibold },
    weekNumber: { color: c.brandStrong, fontFamily: fonts.bold },
  });
