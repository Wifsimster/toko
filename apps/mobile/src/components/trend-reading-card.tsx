import { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { fonts } from "./ui";
import { Mo } from "./mo/mo";
import { useInsights } from "../hooks/use-insights";
import { insights as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import { readTrend } from "../lib/insight-reading";
import { useTheme, type Palette } from "../lib/theme";

export function TrendReadingCard({ childId }: { childId: string }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { fontScale } = useWindowDimensions();
  const stats = useInsights(childId, "month");

  if (stats.isError) return null;
  if (!stats.data) {
    return <View style={[s.card, s.placeholder]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />;
  }

  const reading = readTrend(stats.data.symptoms, todayISO());
  const sentence = reading ? copy[reading.direction][reading.dimension] : copy.steady;
  const hint = reading ? (reading.direction === "better" ? copy.betterHint : copy.harderHint) : copy.steadyHint;

  return (
    <View style={s.card}>
      <View style={s.text}>
        <Text style={s.kicker} importantForAccessibility="no" accessibilityElementsHidden>
          {copy.kicker}
        </Text>
        <Text style={s.title} accessibilityRole="header">
          {sentence}
        </Text>
        <Text style={s.hint}>{hint}</Text>
      </View>
      <Mo state="enquete" size={fontScale >= 1.3 ? 64 : 84} style={s.mo} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 6,
      backgroundColor: c.surfaceLavender,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    placeholder: { minHeight: 132 },
    text: { flex: 1, gap: 2, alignSelf: "flex-start" },
    kicker: { fontFamily: fonts.hand, fontSize: 19, color: c.text },
    title: {
      fontFamily: fonts.heading,
      fontSize: 19,
      lineHeight: 24,
      letterSpacing: -0.2,
      color: c.text,
    },
    hint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, color: c.subtext, marginTop: 4 },
    mo: { marginBottom: -4 },
  });
