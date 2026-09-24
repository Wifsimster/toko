import { useCurrentFrame, useVideoConfig } from "remotion";
import { calm, fadeUp } from "../anim";
import { Phone } from "../components/Phone";
import { Scene } from "../components/Scene";
import { useLayout } from "../layout";
import { colors, fonts } from "../theme";

export type FeatureProps = {
  step: number;
  kicker: string;
  title: string;
  body: string;
  screenTitle: string;
  Screen: React.FC<{ s: number }>;
};

// Une fonctionnalité = un message + un écran. Rien d'autre à l'image.
export const Feature: React.FC<FeatureProps> = ({ step, kicker, title, body, screenTitle, Screen }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, landscape } = useLayout();
  const phoneIn = calm(frame, fps, 4, 30);
  const s = (landscape ? 0.95 : 0.62) * u;

  return (
    <Scene>
      <div
        style={{
          display: "flex",
          flexDirection: landscape ? "row" : "column",
          alignItems: "center",
          gap: (landscape ? 140 : 40) * u,
          padding: `0 ${80 * u}px`,
        }}
      >
        <div style={{ maxWidth: (landscape ? 760 : 900) * u, textAlign: landscape ? "left" : "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16 * u,
              fontSize: 30 * u,
              fontWeight: 700,
              color: colors.teal,
              textTransform: "uppercase",
              letterSpacing: 3 * u,
              ...fadeUp(frame, fps, 8),
            }}
          >
            <span
              style={{
                width: 50 * u,
                height: 50 * u,
                borderRadius: 999,
                background: colors.tealSoft,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                letterSpacing: 0,
              }}
            >
              {step}
            </span>
            {kicker}
          </div>
          <div
            style={{
              fontFamily: fonts.heading,
              fontWeight: 600,
              fontSize: (landscape ? 80 : 64) * u,
              lineHeight: 1.08,
              marginTop: 24 * u,
              ...fadeUp(frame, fps, 16),
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: (landscape ? 38 : 34) * u, lineHeight: 1.4, color: colors.inkSoft, marginTop: 24 * u, ...fadeUp(frame, fps, 26) }}>
            {body}
          </div>
        </div>
        <div style={{ opacity: phoneIn, transform: `translateY(${(1 - phoneIn) * 60 * u}px)` }}>
          <Phone scale={s} title={screenTitle}>
            <Screen s={s} />
          </Phone>
        </div>
      </div>
    </Scene>
  );
};
