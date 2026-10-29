import { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ChildMoState } from "@focusflow/mo/child";

import { fonts } from "../ui";
import { mo as copy } from "../../lib/copy";
import { useTheme, type Palette } from "../../lib/theme";
import { Mo } from "./mo";

export function MoSays({
  state,
  size,
  text,
  moSide = "left",
  breathe,
  compact = false,
  style,
}: {
  state: ChildMoState;
  size: number;
  text: string;
  moSide?: "left" | "right" | "below";
  breathe?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const mo = <Mo state={state} size={size} breathe={breathe} />;
  const bubble = (
    <View style={[s.bubble, compact && s.bubbleCompact]}>
      <Text style={[s.bubbleText, compact && s.bubbleTextCompact]}>{text}</Text>
    </View>
  );
  return (
    <View
      style={[moSide === "below" ? s.column : s.row, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={copy.says(text)}
    >
      {moSide === "left" ? (
        <>
          {mo}
          {bubble}
        </>
      ) : (
        <>
          {bubble}
          {mo}
        </>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    column: { alignItems: "center", gap: 6 },
    bubble: {
      flexShrink: 1,
      borderWidth: 2.5,
      borderColor: c.text,
      backgroundColor: c.card,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 8,
    },
    bubbleText: { fontFamily: fonts.hand, fontSize: 24, color: c.text },
    bubbleCompact: { borderWidth: 2, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 4 },
    bubbleTextCompact: { fontSize: 20 },
  });
