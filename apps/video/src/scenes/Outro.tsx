import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp } from "../anim";
import { Mark } from "../components/Mark";
import { Scene } from "../components/Scene";
import { useLayout } from "../layout";
import { colors, fonts } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();

  return (
    <Scene background={colors.teal} color={colors.cream}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: `0 ${60 * u}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 * u }}>
          <Mark size={150 * u} color={colors.cream} />
          <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 130 * u, letterSpacing: -2 * u, ...fadeUp(frame, fps, 12) }}>Tokō</div>
        </div>
        <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 64 * u, marginTop: 40 * u, ...fadeUp(frame, fps, 26) }}>
          Du calme. Une chose à la fois.
        </div>
        <div
          style={{
            marginTop: 56 * u,
            background: colors.cream,
            color: colors.teal,
            borderRadius: 999,
            padding: `${22 * u}px ${54 * u}px`,
            fontSize: 40 * u,
            fontWeight: 700,
            ...fadeUp(frame, fps, 42),
          }}
        >
          Essayer gratuitement
        </div>
        <div style={{ marginTop: 28 * u, fontSize: 34 * u, ...fadeUp(frame, fps, 52) }}>toko.battistella.ovh</div>
      </div>
    </Scene>
  );
};
