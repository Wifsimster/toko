import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowRight } from "lucide-react-native";

import { fonts } from "../ui";
import { Mo } from "../mo/mo";
import { GardenWeekRow } from "./week-row";
import { pause as copy } from "../../lib/copy";
import { useTheme, type Palette } from "../../lib/theme";
import { useGarden } from "../../hooks/use-pauses";

export function HomePauseCard({ onStart, primary = false }: { onStart: () => void; primary?: boolean }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.card}>
      <View style={s.head}>
        <View style={s.headText}>
          <Text style={s.note} importantForAccessibility="no" accessibilityElementsHidden>
            {copy.homeNote}
          </Text>
          <Text style={s.title} accessibilityRole="header">
            {copy.homeTitle}
          </Text>
          <Text style={s.body}>{copy.homeBody}</Text>
        </View>
        <Mo state="calme" size={110} />
      </View>
      <View style={s.actions}>
        <Pressable
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel={copy.homeStartLabel}
          style={({ pressed }) => [s.start, !primary && s.startSecondary, pressed && s.pressed]}
        >
          <Text style={[s.startText, !primary && s.startTextSecondary]}>{copy.homeStart}</Text>
          <ArrowRight size={20} color={primary ? c.onPrimary : c.text} />
        </Pressable>
        <View style={s.chip} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Text style={s.chipText}>{copy.homeChip}</Text>
        </View>
      </View>
    </View>
  );
}

export function HomeGardenCard({ onOpen }: { onOpen: () => void }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const garden = useGarden();
  return (
    <View style={s.garden}>
      <View style={s.gardenHead}>
        <View style={s.headText}>
          <Text style={s.gardenLabel} accessibilityRole="header">
            {copy.gardenLabel}
          </Text>
          <Text style={s.gardenHint}>{copy.gardenHint}</Text>
        </View>
        <Pressable
          onPress={onOpen}
          accessibilityRole="link"
          accessibilityLabel={copy.gardenSeeLabel}
          style={({ pressed }) => [s.see, pressed && s.pressed]}
        >
          <Text style={s.seeText}>{copy.gardenSee}</Text>
        </Pressable>
      </View>
      {garden.data ? <GardenWeekRow garden={garden.data} /> : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surfaceMint,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 14,
      gap: 12,
    },
    head: { flexDirection: "row", alignItems: "center", gap: 6 },
    headText: { flex: 1, gap: 2 },
    note: { fontFamily: fonts.hand, fontSize: 19, color: c.text },
    title: { fontFamily: fonts.heading, fontSize: 21, lineHeight: 25, letterSpacing: -0.4, color: c.text },
    body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, color: c.subtext, marginTop: 2 },
    actions: { flexDirection: "row", alignItems: "center", gap: 10 },
    start: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      minHeight: 50,
      borderRadius: 999,
      backgroundColor: c.primary,
    },
    startSecondary: { backgroundColor: c.card, borderWidth: 1.5, borderColor: c.border },
    startText: { fontFamily: fonts.semibold, fontSize: 17, color: c.onPrimary },
    startTextSecondary: { color: c.text },
    chip: {
      minHeight: 36,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: c.card,
      justifyContent: "center",
    },
    chipText: { fontFamily: fonts.semibold, fontSize: 14, color: c.brandStrong },
    pressed: { opacity: 0.85 },
    garden: {
      backgroundColor: c.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
    },
    gardenHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    gardenLabel: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
    gardenHint: { fontFamily: fonts.body, fontSize: 13, color: c.muted },
    see: { minHeight: 44, minWidth: 44, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" },
    seeText: { fontFamily: fonts.semibold, fontSize: 15, color: c.brandStrong, textDecorationLine: "underline" },
  });
