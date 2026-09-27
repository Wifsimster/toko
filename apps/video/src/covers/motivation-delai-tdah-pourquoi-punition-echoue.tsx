import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « motivation-delai-tdah-pourquoi-punition-echoue ».
// Au loin, sur la ligne du temps, le « cadeau samedi » reste flou : trop loin.
// Au premier plan, le tableau de points se remplit d'étoiles, une à une, tout de
// suite ; les trois principes (immédiat, fréquent, saillant) s'allument. Tout se
// range et le cycle reprend. La première image (affiche) montre l'état complet.

const OFFSET = 44;
const RESET = [48, 55];
const STARS = [4, 10, 16, 22, 28]; // arrivée de chaque étoile, en pas
const PRINCIPLES = [
  { text: "Immédiat", at: 6 },
  { text: "Fréquent", at: 18 },
  { text: "Saillant", at: 30 },
];

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5-4.9-4.6 6.6-.8z";
const BOARD = { left: 64, top: 556, width: 800, height: 244 };

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  // Le cadeau lointain flotte à peine, un tour entier par boucle.
  const drift = Math.sin((2 * Math.PI * s) / 60) * 4;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Aversion au délai" title="Pourquoi le long terme ne marche pas" subtitle="Pas demain, pas samedi. Maintenant." />

      <TimeLine drift={drift} />
      <Board story={story} keep={keep} />

      <div style={{ position: "absolute", left: 64, right: 64, top: 858, display: "flex", gap: 22 }}>
        {PRINCIPLES.map((p) => {
          const on = ramp(story, p.at, p.at + 4) * keep;
          return (
            <div
              key={p.text}
              style={{
                flex: 1,
                height: 68,
                borderRadius: 999,
                border: `2px solid ${colors.teal}`,
                background: `rgba(53,136,145,${on})`,
                color: on > 0.5 ? colors.cream : colors.teal,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                opacity: 0.45 + 0.55 * on,
              }}
            >
              {p.text}
            </div>
          );
        })}
      </div>

      <CoverFooter sources="sources Sonuga-Barke, R. Barkley (programme PEHP)" />
    </AbsoluteFill>
  );
};

// Ligne du temps : « Maintenant » net à gauche, « Cadeau samedi » flou au loin.
const TimeLine: React.FC<{ drift: number }> = ({ drift }) => (
  <>
    <div style={{ position: "absolute", left: 64, top: 404, fontSize: 26, fontWeight: 700, color: colors.teal }}>Maintenant</div>
    <svg width={928} height={40} style={{ position: "absolute", left: 0, top: 402 }}>
      <line x1={228} x2={622} y1={20} y2={20} stroke={colors.inkSoft} strokeOpacity={0.45} strokeWidth={3} strokeDasharray="4 12" strokeLinecap="round" />
    </svg>
    <div
      style={{
        position: "absolute",
        left: 640,
        top: 372 + drift,
        width: 224,
        display: "flex",
        alignItems: "center",
        gap: 14,
        filter: "blur(1.6px)",
        opacity: 0.55,
      }}
    >
      <svg width={64} height={64} viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
        <rect x={8} y={26} width={48} height={32} rx={6} fill={colors.honeySoft} stroke={colors.honey} strokeWidth={3} />
        <rect x={4} y={16} width={56} height={12} rx={4} fill={colors.honeySoft} stroke={colors.honey} strokeWidth={3} />
        <line x1={32} x2={32} y1={16} y2={58} stroke={colors.honey} strokeWidth={3} />
        <path d="M32 16 q-12 -14 -16 -4 q4 6 16 4 q12 -14 16 -4 q-4 6 -16 4" fill="none" stroke={colors.honey} strokeWidth={3} />
      </svg>
      <span style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.15, color: colors.inkSoft }}>Cadeau samedi</span>
    </div>
    <div style={{ position: "absolute", left: 640, top: 452, width: 224, fontSize: 22, fontWeight: 600, color: colors.inkSoft, textAlign: "center" }}>
      Trop loin
    </div>
  </>
);

const Board: React.FC<{ story: number; keep: number }> = ({ story, keep }) => (
  <div
    style={{
      position: "absolute",
      ...BOARD,
      background: "#fff",
      borderRadius: 26,
      border: `2px solid ${colors.line}`,
      boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
      boxSizing: "border-box",
      padding: "30px 40px",
    }}
  >
    <div style={{ fontSize: 24, fontWeight: 600, color: colors.inkSoft, letterSpacing: 1 }}>Tableau de points</div>
    <div style={{ marginTop: 26, display: "flex", justifyContent: "space-between" }}>
      {STARS.map((t) => {
        const on = ramp(story, t, t + 3) * keep;
        return (
          <div
            key={t}
            style={{
              width: 118,
              height: 118,
              borderRadius: 26,
              background: colors.cream,
              border: `2px dashed ${colors.line}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={84} height={84} viewBox="0 0 24 24" style={{ opacity: on, transform: `translateY(${-10 * (1 - on)}px) scale(${0.9 + 0.1 * on})` }}>
              <path d={STAR} fill={colors.honey} />
            </svg>
          </div>
        );
      })}
    </div>
  </div>
);

export default Cover;
