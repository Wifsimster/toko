import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Lock } from "lucide-react-native";

import { fonts } from "./ui";
import { useTheme, type Palette } from "../lib/theme";

export type StatsPeriod = "week" | "month" | "quarter";

export const PERIOD_LABELS: Record<StatsPeriod, string> = {
  week: "Semaine",
  month: "Mois",
  quarter: "Trimestre",
};

// month/quarter are premium on the web; mirror that gating on mobile.
const LOCKED: StatsPeriod[] = ["month", "quarter"];

// Segmented period selector with premium-locked options. Tapping a locked
// period (non-premium) calls onLocked instead of changing the value.
export function PeriodSwitcher({
  value,
  onChange,
  isPremium,
  onLocked,
}: {
  value: StatsPeriod;
  onChange: (p: StatsPeriod) => void;
  isPremium: boolean;
  onLocked?: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const periods: StatsPeriod[] = ["week", "month", "quarter"];

  return (
    <View style={s.row}>
      {periods.map((p) => {
        const on = p === value;
        const locked = !isPremium && LOCKED.includes(p);
        return (
          <Pressable
            key={p}
            onPress={() => (locked ? onLocked?.() : onChange(p))}
            style={[s.chip, on && s.chipOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            {locked ? <Lock size={12} color={on ? "#fff" : c.muted} /> : null}
            <Text style={[s.text, on && s.textOn]}>{PERIOD_LABELS[p]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: "row", gap: 8 },
    chip: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chipOn: { backgroundColor: c.brand, borderColor: c.brand },
    text: { fontSize: 14, color: c.subtext, fontFamily: fonts.medium },
    textOn: { color: "#fff", fontFamily: fonts.semibold },
  });
