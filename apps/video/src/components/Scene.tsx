import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";

export const Scene: React.FC<{ children: React.ReactNode; background?: string; color?: string }> = ({
  children,
  background = colors.cream,
  color = colors.ink,
}) => (
  <AbsoluteFill
    style={{
      background,
      color,
      fontFamily: fonts.sans,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);
