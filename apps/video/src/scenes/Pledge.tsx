import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp } from "../anim";
import { Mark } from "../components/Mark";
import { Scene } from "../components/Scene";
import { useLayout } from "../layout";
import { colors, fonts } from "../theme";

export const Pledge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();

  return (
    <Scene>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 * u, textAlign: "center", padding: `0 ${60 * u}px` }}>
        <Mark size={130 * u} color={colors.teal} />
        <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 84 * u, lineHeight: 1.1, ...fadeUp(frame, fps, 14) }}>
          Tokō garde le fil pour vous.
        </div>
        <div style={{ fontSize: 44 * u, color: colors.inkSoft, ...fadeUp(frame, fps, 30) }}>
          Quelques minutes par soir. <span style={{ color: colors.teal, fontWeight: 700 }}>Une seule chose à la fois.</span>
        </div>
      </div>
    </Scene>
  );
};
