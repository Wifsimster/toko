import { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { moIcons } from "@focusflow/mo/icons";

import type { IconSpec, MoIconName } from "../lib/icon-for";
import { useTheme, type Palette } from "../lib/theme";
import { fonts } from "./ui";
import { ArtSvg } from "./mo/art";
import { a11yImage } from "./mo/mo";
import { Picto } from "./mo/companion";

export function ItemIcon({
  spec,
  size,
  fallback,
  color,
  style,
}: {
  spec: IconSpec | undefined;
  size: number;
  fallback?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  if (spec?.kind === "picto") return <Picto name={spec.name} size={size} style={style} />;
  if (spec?.kind === "mo-icon") return <MoIcon name={spec.name} size={size} style={style} />;
  if (spec?.kind === "lucide") {
    const Icon = spec.icon;
    return (
      <View {...a11yImage(undefined)} style={[{ width: size, height: size }, s.center, style]}>
        <Icon size={Math.round(size * 0.8)} color={color ?? c.muted} />
      </View>
    );
  }
  const initial = fallback?.trim().charAt(0).toLocaleUpperCase("fr-FR");
  if (!initial) return null;
  return (
    <View
      {...a11yImage(undefined)}
      style={[{ width: size, height: size, borderRadius: size / 2 }, s.center, s.initial, style]}
    >
      <Text style={[s.initialText, { fontSize: Math.round(size * 0.45) }]}>{initial}</Text>
    </View>
  );
}

export function MoIcon({ name, size, style }: { name: MoIconName; size: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View {...a11yImage(undefined)} style={[{ width: size, height: size }, style]}>
      <ArtSvg art={moIcons[name]} size={size} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { alignItems: "center", justifyContent: "center" },
    initial: { backgroundColor: c.surfaceMint },
    initialText: { color: c.text, fontFamily: fonts.semibold },
  });
