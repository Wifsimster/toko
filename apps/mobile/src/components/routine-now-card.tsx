import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Play } from "lucide-react-native";
import type { Routine } from "@focusflow/validators";

import { fonts } from "./ui";
import { Mo } from "./mo/mo";
import { ItemIcon } from "./item-icon";
import { routines as copy } from "../lib/copy";
import { iconFor } from "../lib/icon-for";
import { SLOT_SURFACE, routineMinutes } from "../lib/routine-now";
import { useTheme, type Palette } from "../lib/theme";

const MAX_STEP_ICONS = 5;

export function RoutineNowCard({
  routine,
  childName,
  completedStepIds,
  onLaunch,
}: {
  routine: Routine;
  childName: string;
  completedStepIds: ReadonlySet<string>;
  onLaunch: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const steps = [...routine.steps].sort((a, b) => a.position - b.position);
  const minutes = routineMinutes(routine);
  const canLaunch = steps.some((st) => (st.durationMinutes ?? 0) > 0 && !completedStepIds.has(st.id));
  const launchLabel = childName ? copy.now.launchWithName(childName) : copy.now.launch;
  const surface = c[SLOT_SURFACE[routine.timeOfDay]];

  return (
    <View style={[s.card, { backgroundColor: surface }]}>
      <View style={s.mo}>
        <Mo state="theme-cadre" size={88} />
      </View>
      <Text style={s.kicker} importantForAccessibility="no" accessibilityElementsHidden>
        {copy.now.kicker[routine.timeOfDay]}
      </Text>
      <Text
        style={s.title}
        accessibilityRole="header"
        accessibilityLabel={`${copy.now.kicker[routine.timeOfDay]} · ${routine.name}`}
      >
        {routine.name}
      </Text>
      <View style={s.icons} accessibilityRole="list" accessibilityLabel={copy.now.stepsLabel}>
        {steps.slice(0, MAX_STEP_ICONS).map((st) => {
          const done = completedStepIds.has(st.id);
          return (
            <View
              key={st.id}
              style={[s.icon, done && s.iconDone]}
              accessible
              accessibilityLabel={done ? `${st.label}, ${copy.done}` : st.label}
            >
              <ItemIcon spec={iconFor({ label: st.label, emoji: st.emoji, kind: "step" })} size={26} />
            </View>
          );
        })}
      </View>
      <View style={s.actions}>
        {canLaunch ? (
          <Pressable onPress={onLaunch} style={s.launch} accessibilityRole="button" accessibilityLabel={launchLabel}>
            <Play size={16} color={c.onPrimary} fill={c.onPrimary} />
            <Text style={s.launchText}>{launchLabel}</Text>
          </Pressable>
        ) : null}
        <View style={s.chip}>
          <Text style={s.chipText}>
            {minutes > 0 ? copy.now.meta(steps.length, minutes) : copy.now.metaSteps(steps.length)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { borderRadius: 28, padding: 18, gap: 10, overflow: "hidden" },
    mo: { position: "absolute", top: 10, right: 6 },
    kicker: { fontFamily: fonts.hand, fontSize: 21, color: c.text, paddingRight: 96 },
    title: {
      fontFamily: fonts.heading,
      fontSize: 23,
      lineHeight: 27,
      letterSpacing: -0.4,
      color: c.text,
      paddingRight: 96,
    },
    icons: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingRight: 88 },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      alignItems: "center",
      justifyContent: "center",
    },
    iconDone: { opacity: 0.4 },
    actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 4 },
    launch: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 48,
      paddingHorizontal: 20,
      borderRadius: 999,
      backgroundColor: c.primary,
    },
    launchText: { fontFamily: fonts.semibold, fontSize: 16, color: c.onPrimary },
    chip: { backgroundColor: c.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
    chipText: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  });
