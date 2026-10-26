import { useMemo } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { CalloutCard, fonts } from "../ui";
import { mo as copy } from "../../lib/copy";
import { useTheme, type Palette } from "../../lib/theme";
import { Mo, type AppMoState } from "./mo";

/** Côté du dessin : petit, à côté du texte (version petite sous 96 px). */
const MO_TIP_SIZE = 64;

/**
 * Un conseil livré par Mō : l'encadré « tip » (`CalloutCard`), Mō en petit à
 * gauche et le conseil en texte courant (jamais en manuscrit : c'est une
 * information). Mō et le conseil forment un seul élément pour le lecteur
 * d'écran (« Mō : <conseil> ») ; le titre de l'encadré reste lu à part.
 * Mō ne bouge pas. Un seul Mō par écran : ne pas poser un `MoTip` sur un
 * écran qui montre déjà Mō, ni près d'un paywall, du rapport ou du SOS.
 */
export function MoTip({
  label,
  tip,
  state = "calme",
  style,
}: {
  /** Titre de l'encadré (« Conseil du jour »). */
  label?: string;
  tip: string;
  state?: AppMoState;
  style?: ViewStyle;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <CalloutCard variant="tip" label={label} style={style}>
      <View style={s.row} accessible accessibilityRole="text" accessibilityLabel={copy.says(tip)}>
        <Mo state={state} size={MO_TIP_SIZE} />
        <Text style={s.tip}>{tip}</Text>
      </View>
    </CalloutCard>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    tip: { flex: 1, fontSize: 15, color: c.text, fontFamily: fonts.body, lineHeight: 22 },
  });
