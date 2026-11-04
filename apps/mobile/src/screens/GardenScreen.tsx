import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button, Screen, ScreenHeader, fonts } from "../components/ui";
import { Mo } from "../components/mo/mo";
import { GardenPot } from "../components/pause/garden-pot";
import { GardenWeekRow } from "../components/pause/week-row";
import { pause as copy } from "../lib/copy";
import { useTheme, type Palette } from "../lib/theme";
import { useGarden } from "../hooks/use-pauses";
import { backIfPushed } from "../navigation/tabs";
import type { GardenProps } from "../navigation/types";

export function GardenScreen({ navigation }: GardenProps) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const garden = useGarden();
  const leaves = garden.data?.leaves ?? 0;

  return (
    <Screen scroll>
      <ScreenHeader title={copy.gardenTitle} subtitle={copy.gardenSubtitle} onBack={backIfPushed(navigation)} />
      <View style={s.potCard}>
        <View style={s.potRow}>
          <GardenPot leaves={leaves} width={170} />
          <Mo state="calme" size={64} />
        </View>
        <Text style={s.note} importantForAccessibility="no" accessibilityElementsHidden>
          {copy.gardenGrowNote}
        </Text>
        {garden.data && leaves === 0 ? <Text style={s.empty}>{copy.gardenEmpty}</Text> : null}
      </View>
      {garden.data ? (
        <View style={s.weekCard}>
          <Text style={s.weekTitle} accessibilityRole="header">
            {copy.weekTitle}
          </Text>
          <GardenWeekRow garden={garden.data} />
          <Text style={s.weekBody}>{copy.weekBody}</Text>
        </View>
      ) : null}
      <Button label={copy.doPause} onPress={() => navigation.navigate("Pause")} />
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    potCard: {
      backgroundColor: c.surfaceSage,
      borderRadius: 22,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: "center",
      gap: 8,
    },
    potRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 4 },
    note: { fontFamily: fonts.hand, fontSize: 21, color: c.text, textAlign: "center" },
    empty: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: c.subtext, textAlign: "center" },
    weekCard: {
      backgroundColor: c.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 12,
    },
    weekTitle: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
    weekBody: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: c.muted },
  });
