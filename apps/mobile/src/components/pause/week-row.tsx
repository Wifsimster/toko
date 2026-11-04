import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Leaf } from "lucide-react-native";
import type { Garden } from "@focusflow/validators";

import { fonts } from "../ui";
import { gardenWeek } from "../../lib/pause";
import { useTheme, type Palette } from "../../lib/theme";

export function GardenWeekRow({ garden }: { garden: Pick<Garden, "today" | "week"> }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const days = gardenWeek(garden);
  return (
    <View style={s.row}>
      {days.map((day) => (
        <View key={day.date} style={s.day} accessible accessibilityRole="text" accessibilityLabel={day.label}>
          <Text style={[s.letter, day.today && s.letterToday]}>{day.letter}</Text>
          <View style={[s.slot, day.leaf ? s.slotLeaf : day.today ? s.slotToday : null]}>
            {day.leaf ? <Leaf size={18} color={c.brandStrong} fill={c.card} strokeWidth={2} /> : <View style={s.dot} />}
          </View>
        </View>
      ))}
    </View>
  );
}

const SLOT = 34;

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "space-between" },
    day: { flex: 1, alignItems: "center", gap: 6, minHeight: 44 },
    letter: { fontFamily: fonts.medium, fontSize: 13, color: c.muted },
    letterToday: { fontFamily: fonts.bold, color: c.text },
    slot: {
      width: SLOT,
      height: SLOT,
      borderRadius: SLOT / 2,
      alignItems: "center",
      justifyContent: "center",
    },
    slotLeaf: { backgroundColor: c.surfaceMint },
    slotToday: { borderWidth: 1.5, borderStyle: "dashed", borderColor: c.brand },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.mutedSurface, borderWidth: 1, borderColor: c.border },
  });
