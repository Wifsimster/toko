import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Check } from "lucide-react-native";

import { fonts } from "./ui";
import { Mo } from "./mo/mo";
import { useLogMedication, type MedicationAdherence } from "../hooks/use-medications";
import { medications as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import { useTheme, type Palette } from "../lib/theme";

export function MedicationTodayCard({ childId, meds }: { childId: string; meds: readonly MedicationAdherence[] }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { fontScale } = useWindowDimensions();
  const log = useLogMedication(childId);

  const next = meds.find((m) => m.todayTaken === null) ?? null;
  const record = (med: MedicationAdherence, taken: boolean) =>
    log.mutate({ medicationId: med.id, date: todayISO(), taken });
  const meta = next ? [next.dose, copy.schedule[next.schedule]].filter(Boolean).join(" · ") : "";

  return (
    <View style={s.card}>
      <View style={s.head}>
        <View style={s.text}>
          <Text style={s.kicker} importantForAccessibility="no" accessibilityElementsHidden>
            {copy.todayKicker}
          </Text>
          <Text style={s.title} accessibilityRole="header">
            {next ? next.name : copy.allDone}
          </Text>
          {next ? (meta ? <Text style={s.body}>{meta}</Text> : null) : <Text style={s.body}>{copy.allDoneHint}</Text>}
        </View>
        <Mo state="theme-soins" size={fontScale >= 1.3 ? 64 : 84} />
      </View>

      {next ? (
        <View style={s.actions}>
          <Pressable
            onPress={() => record(next, true)}
            disabled={log.isPending}
            style={[s.taken, log.isPending && s.disabled]}
            accessibilityRole="button"
            accessibilityLabel={copy.takenLabel(next.name)}
            accessibilityState={{ disabled: log.isPending }}
          >
            <Check size={18} color={c.onPrimary} strokeWidth={2.5} />
            <Text style={s.takenText}>{copy.taken}</Text>
          </Pressable>
          <Pressable
            onPress={() => record(next, false)}
            disabled={log.isPending}
            style={[s.notToday, log.isPending && s.disabled]}
            accessibilityRole="button"
            accessibilityLabel={copy.notTodayLabel(next.name)}
            accessibilityState={{ disabled: log.isPending }}
          >
            <Text style={s.notTodayText}>{copy.notToday}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surfaceSky,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 14,
      gap: 12,
    },
    head: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
    text: { flex: 1, gap: 2 },
    kicker: { fontFamily: fonts.hand, fontSize: 19, color: c.text },
    title: {
      fontFamily: fonts.heading,
      fontSize: 21,
      lineHeight: 25,
      letterSpacing: -0.4,
      color: c.text,
    },
    body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, color: c.subtext, marginTop: 2 },
    actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
    taken: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 48,
      paddingHorizontal: 22,
      borderRadius: 999,
      backgroundColor: c.primary,
    },
    takenText: { fontFamily: fonts.semibold, fontSize: 16, color: c.onPrimary },
    notToday: { minHeight: 48, minWidth: 44, paddingHorizontal: 14, justifyContent: "center" },
    notTodayText: { fontFamily: fonts.medium, fontSize: 15, color: c.subtext },
    disabled: { opacity: 0.5 },
  });
