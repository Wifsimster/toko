import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { X } from "lucide-react-native";

import { CalloutCard, fonts } from "../ui";
import { mo as copy } from "../../lib/copy";
import { useMoTip, type MoTipContext } from "../../lib/mo-tips";
import { useTheme, type Palette } from "../../lib/theme";
import { Mo, type AppMoState } from "./mo";

/** Côté du dessin : petit, à côté du texte (version petite sous 96 px). */
const MO_TIP_SIZE = 64;

/**
 * Un conseil livré par Mō : l'encadré « tip » (`CalloutCard`), Mō en petit à
 * gauche et le conseil en texte courant (jamais en manuscrit : c'est une
 * information). Mō et le conseil forment un seul élément pour le lecteur
 * d'écran (« Mō : <conseil> ») ; le titre de l'encadré reste lu à part.
 * Avec `onDismiss`, une croix « Masquer le conseil » en haut à droite.
 * Mō ne bouge pas. Un seul Mō par écran : ne pas poser un `MoTip` sur un
 * écran qui montre déjà Mō, ni près d'un paywall, du rapport ou du SOS.
 */
export function MoTip({
  label,
  tip,
  state = "calme",
  onDismiss,
  style,
}: {
  /** Titre de l'encadré (« Conseil du jour »). */
  label?: string;
  tip: string;
  state?: AppMoState;
  /** Masque le conseil (voir `useMoTip`). */
  onDismiss?: () => void;
  style?: ViewStyle;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <CalloutCard variant="tip" label={label} style={style}>
      <View
        style={[s.row, onDismiss && !label ? s.rowBesideClose : null]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={copy.says(tip)}
      >
        <Mo state={state} size={MO_TIP_SIZE} />
        <Text style={s.tip}>{tip}</Text>
      </View>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          style={s.close}
          accessibilityRole="button"
          accessibilityLabel={copy.hideTip}
        >
          <X size={18} color={c.muted} />
        </Pressable>
      ) : null}
    </CalloutCard>
  );
}

/**
 * Le conseil du jour de Mō pour un écran (`lib/mo-tips.ts`), masquable :
 * rien si le contexte n'a pas de conseil ou si le parent l'a masqué. Ne le
 * poser que là où l'écran ne montre pas déjà Mō (DESIGN.md, « Mō sur
 * mobile »).
 */
export function DailyMoTip({ context, style }: { context: MoTipContext; style?: ViewStyle }) {
  const { tip, dismiss } = useMoTip(context);
  if (!tip) return null;
  return <MoTip label={copy.tipLabel} tip={tip.text} onDismiss={dismiss} style={style} />;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    // Sans titre, la croix est posée sur la ligne du conseil : on lui laisse sa place.
    rowBesideClose: { paddingRight: 32 },
    tip: { flex: 1, fontSize: 15, color: c.text, fontFamily: fonts.body, lineHeight: 22 },
    // Cible tactile de 44 px dans le coin, alignée sur le titre de l'encadré.
    close: {
      position: "absolute",
      top: 2,
      right: 2,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
  });
