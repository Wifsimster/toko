import { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ChildMoState } from "@focusflow/mo/child";

import { fonts } from "../ui";
import { mo as copy } from "../../lib/copy";
import { useTheme, type Palette } from "../../lib/theme";
import { Mo } from "./mo";

/**
 * Mō et sa bulle (une phrase de 4 mots au plus, en manuscrit). L'ensemble
 * forme un seul élément pour le lecteur d'écran (« Mō : Juste celle-là. ») ;
 * le dessin seul y reste caché.
 */
export function MoSays({
  state,
  size,
  text,
  moSide = "left",
  breathe,
  style,
}: {
  state: ChildMoState;
  size: number;
  text: string;
  /** Où se tient Mō : la bulle va de l'autre côté, ou au-dessus (`below`). */
  moSide?: "left" | "right" | "below";
  breathe?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const mo = <Mo state={state} size={size} breathe={breathe} />;
  const bubble = (
    <View style={s.bubble}>
      <Text style={s.bubbleText}>{text}</Text>
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
  });
