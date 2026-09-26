import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, fadeUp } from "../anim";
import { Scene } from "../components/Scene";
import { useLayout } from "../layout";
import { colors, fonts } from "../theme";

// Ce qui encombre la tête d'un parent le soir. Les mots arrivent, puis se rangent.
const WORDS: { text: string; x: number; y: number }[] = [
  { text: "Devoirs", x: -0.62, y: -0.55 },
  { text: "Médicaments", x: 0.62, y: -0.66 },
  { text: "Rendez-vous", x: -0.8, y: -0.3 },
  { text: "Crise du soir", x: 0.8, y: 0.28 },
  { text: "Sommeil", x: -0.62, y: 0.66 },
  { text: "Mot de l'école", x: 0.5, y: 0.6 },
  { text: "Écrans", x: 0.02, y: -0.82 },
  { text: "Routines", x: 0.05, y: 0.84 },
];

export const Overload: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, width, height } = useLayout();
  const settle = ease(frame, 95, 135);

  return (
    <Scene>
      {WORDS.map((w, i) => {
        const appear = fadeUp(frame, fps, 6 + i * 6, 16);
        const drift = Math.sin((frame + i * 20) / 22) * 6 * u;
        const x = w.x * width * 0.44 * (1 - settle);
        const y = w.y * height * 0.4 * (1 - settle) + drift;
        return (
          <div
            key={w.text}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${1 - 0.5 * settle})`,
              opacity: Number(appear.opacity) * (1 - settle) * 0.9,
              fontSize: 40 * u,
              fontWeight: 600,
              color: colors.inkSoft,
              background: "#fff",
              border: `${2 * u}px solid ${colors.line}`,
              borderRadius: 999,
              padding: `${12 * u}px ${28 * u}px`,
              whiteSpace: "nowrap",
            }}
          >
            {w.text}
          </div>
        );
      })}
      <div
        style={{
          fontFamily: fonts.heading,
          fontWeight: 600,
          fontSize: 76 * u,
          textAlign: "center",
          lineHeight: 1.15,
          maxWidth: 1000 * u,
          ...fadeUp(frame, fps, 50),
          opacity: interpolate(frame, [50, 70, 128, 145], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Le soir, tout se bouscule dans la tête.
      </div>
    </Scene>
  );
};
