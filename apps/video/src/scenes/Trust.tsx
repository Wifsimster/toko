import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp } from "../anim";
import { Scene } from "../components/Scene";
import { useLayout } from "../layout";
import { colors, fonts } from "../theme";

const ITEMS = [
  { title: "Pensée pour les parents TDAH", body: "Des écrans simples, une action à la fois." },
  { title: "Données hébergées en Europe", body: "Conforme au RGPD. Export et suppression en 1 clic." },
  { title: "Sans pub, sans traqueur", body: "Vos données restent les vôtres." },
];

const Check: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
    <circle cx="20" cy="20" r="20" fill={colors.teal} />
    <path d="M12 20.5l5.5 5.5L28.5 14" stroke={colors.cream} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Trust: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();

  return (
    <Scene>
      <div style={{ display: "flex", flexDirection: "column", gap: 44 * u, padding: `0 ${80 * u}px` }}>
        {ITEMS.map((it, i) => (
          <div key={it.title} style={{ display: "flex", alignItems: "center", gap: 32 * u, ...fadeUp(frame, fps, 6 + i * 18) }}>
            <Check size={72 * u} />
            <div>
              <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 60 * u, lineHeight: 1.1 }}>{it.title}</div>
              <div style={{ fontSize: 34 * u, color: colors.inkSoft, marginTop: 8 * u }}>{it.body}</div>
            </div>
          </div>
        ))}
      </div>
    </Scene>
  );
};
