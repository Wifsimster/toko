import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { X } from "lucide-react-native";

import { CalloutCard, fonts } from "../ui";
import { mo as copy } from "../../lib/copy";
import { useMoTip, type MoTipContext } from "../../lib/mo-tips";
import { useTheme, type Palette } from "../../lib/theme";
import { Mo, type AppMoState } from "./mo";

const MO_TIP_SIZE = 64;

export function MoTip({
  label,
  tip,
  state = "calme",
  onDismiss,
  style,
}: {
  label?: string;
  tip: string;
  state?: AppMoState;
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

export function DailyMoTip({ context, style }: { context: MoTipContext; style?: ViewStyle }) {
  const { tip, dismiss } = useMoTip(context);
  if (!tip) return null;
  return <MoTip label={copy.tipLabel} tip={tip.text} onDismiss={dismiss} style={style} />;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    rowBesideClose: { paddingRight: 32 },
    tip: { flex: 1, fontSize: 15, color: c.text, fontFamily: fonts.body, lineHeight: 22 },
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
