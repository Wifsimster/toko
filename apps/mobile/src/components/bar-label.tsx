import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { fonts } from "./ui";

export const BAR_LABEL_SIZE = 10;
export const BAR_LABEL_MIN_SCALE = 0.8;

export function BarLabel({
  children,
  color,
  style,
}: {
  children: string;
  color: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={BAR_LABEL_MIN_SCALE}
      style={[s.label, { color }, style]}
    >
      {children}
    </Text>
  );
}

const s = StyleSheet.create({
  label: {
    fontSize: BAR_LABEL_SIZE,
    fontFamily: fonts.medium,
    textAlign: "center",
    backgroundColor: "transparent",
  },
});
