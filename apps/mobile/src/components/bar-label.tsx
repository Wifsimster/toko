import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { fonts } from "./ui";

export const BAR_LABEL_SIZE = 10;
export const BAR_LABEL_MIN_SCALE = 0.8;
export const BAR_LABEL_LINE_HEIGHT = 13;

export function BarLabel({
  children,
  color,
  position = "below-icon",
  style,
}: {
  children: string;
  color: string;
  position?: "below-icon" | "beside-icon";
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={BAR_LABEL_MIN_SCALE}
      style={[s.label, position === "beside-icon" && s.beside, { color }, style]}
    >
      {children}
    </Text>
  );
}

const s = StyleSheet.create({
  label: {
    fontSize: BAR_LABEL_SIZE,
    lineHeight: BAR_LABEL_LINE_HEIGHT,
    flexShrink: 0,
    includeFontPadding: false,
    fontFamily: fonts.medium,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  beside: {
    marginStart: 5,
    marginEnd: 12,
  },
});
