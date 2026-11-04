import { useMemo } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { HeartPulse } from "lucide-react-native";

import { BarLabel } from "../bar-label";
import { fonts } from "../ui";
import { sos as copy } from "../../lib/copy";
import { SOS_TAB_GAP, SOS_TAB_PADDING_BOTTOM, sosDiscSize } from "../../lib/sos";
import { useTheme, type Palette } from "../../lib/theme";

const SOS_RING = 4;

export function SosDisc({
  size,
  ringColor,
  style,
}: {
  size: number;
  ringColor: string;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View
      style={[
        styles.disc,
        { width: size, height: size, borderRadius: size / 2, borderColor: ringColor },
        style,
      ]}
    >
      <HeartPulse size={Math.round(size * 0.43)} color="#ffffff" />
    </View>
  );
}

export function SosTabLabel() {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <BarLabel color={c.danger} style={styles.label}>
      {copy.buttonLabel}
    </BarLabel>
  );
}

export function SosTabButton({ onPress }: { onPress: () => void }) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const size = sosDiscSize(useWindowDimensions());
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={copy.openLabel}
      testID="sos-button"
      style={styles.tab}
    >
      {({ pressed }) => (
        <>
          <SosDisc size={size} ringColor={c.card} style={pressed && styles.pressed} />
          <SosTabLabel />
        </>
      )}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    tab: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: SOS_TAB_GAP,
      paddingBottom: SOS_TAB_PADDING_BOTTOM,
    },
    disc: {
      backgroundColor: c.danger,
      borderWidth: SOS_RING,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 4,
      elevation: 4,
    },
    label: { fontFamily: fonts.bold },
    pressed: { transform: [{ scale: 0.95 }] },
  });
