import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp } from "../anim";
import { Mark } from "../components/Mark";
import { Scene } from "../components/Scene";
import { useLayout } from "../layout";
import { colors, fonts } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();

  return (
    <Scene background={colors.teal} color={colors.cream}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 * u }}>
        <Mark size={260 * u} color={colors.cream} delay={4} />
        <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 150 * u, letterSpacing: -2 * u, ...fadeUp(frame, fps, 30) }}>
          Tokō
        </div>
      </div>
    </Scene>
  );
};
