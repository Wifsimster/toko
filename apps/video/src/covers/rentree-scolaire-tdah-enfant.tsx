import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « rentree-scolaire-tdah-enfant ». Un cartable
// descend le chemin de la rentrée, dans l'ordre de l'article : ce soir, demain
// matin, au retour, le soir. À chaque étape, sa consigne s'affiche. Tout se range,
// le cartable revient au départ et le cycle reprend. La première image (affiche)
// montre le chemin complet.

const OFFSET = 44;
const RESET = [48, 55];
const ARRIVE = [2, 12, 20, 28]; // arrivée du cartable à chaque étape, en pas
const MOVE = 4; // durée d'un trajet entre deux étapes

const STEPS = [
  { when: "Ce soir", what: "Sac, vêtements, coucher" },
  { when: "Demain matin", what: "Une consigne à la fois" },
  { when: "Au retour", what: "Un sas de 30 à 45 minutes" },
  { when: "Le soir", what: "C'est votre calme qui aide" },
];

const NODE_X = 116;
const NODE_Y = [470, 600, 730, 860];
const CARD = { left: 178, width: 686, height: 108 };

const Cover: React.FC = () => {
  const { story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);

  // Position du cartable : de nœud en nœud, puis retour invisible au départ.
  let y = NODE_Y[0];
  for (let i = 1; i < 4; i++) y += (NODE_Y[i] - NODE_Y[i - 1]) * ramp(story, ARRIVE[i] - MOVE, ARRIVE[i]);
  const bagOpacity = story >= RESET[1] ? ramp(story, RESET[1], 59) : keep;
  if (story >= RESET[1]) y = NODE_Y[0];

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Rentrée scolaire" title="Passer le cap sans y laisser la famille" subtitle="Une étape à la fois." />

      <svg width={928} height={1152} style={{ position: "absolute", inset: 0 }}>
        <line x1={NODE_X} x2={NODE_X} y1={NODE_Y[0]} y2={NODE_Y[3]} stroke={colors.line} strokeWidth={6} strokeLinecap="round" />
        <line x1={NODE_X} x2={NODE_X} y1={NODE_Y[0]} y2={y} stroke={colors.teal} strokeWidth={6} strokeLinecap="round" opacity={keep} />
        {NODE_Y.map((ny, i) => {
          const on = ramp(story, ARRIVE[i] - 1, ARRIVE[i] + 2) * keep;
          return <circle key={ny} cx={NODE_X} cy={ny} r={16} fill={on > 0.5 ? colors.teal : "#fff"} stroke={on > 0.5 ? colors.teal : colors.line} strokeWidth={5} />;
        })}
      </svg>

      {STEPS.map((st, i) => (
        <Step key={st.when} index={i} story={story} keep={keep} {...st} />
      ))}

      <Bag y={y} opacity={bagOpacity} />

      <CoverFooter sources="repères PAP, PPS et MDPH" />
    </AbsoluteFill>
  );
};

const Step: React.FC<{ index: number; when: string; what: string; story: number; keep: number }> = ({ index, when, what, story, keep }) => {
  const enter = ramp(story, ARRIVE[index] - 1, ARRIVE[index] + 3);
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left,
        top: NODE_Y[index] - CARD.height / 2,
        width: CARD.width,
        height: CARD.height,
        transform: `translate(${-30 * (1 - enter)}px, ${14 * (1 - keep)}px)`,
        opacity: enter * keep,
        background: "#fff",
        borderRadius: 24,
        border: `2px solid ${index === 3 ? colors.honey : colors.teal}`,
        boxShadow: "0 14px 30px rgba(53,136,145,0.12)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 28px",
        boxSizing: "border-box",
        gap: 4,
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: index === 3 ? colors.honey : colors.teal }}>{when}</span>
      <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.2 }}>{what}</span>
    </div>
  );
};

// Cartable miel posé sur le chemin.
const Bag: React.FC<{ y: number; opacity: number }> = ({ y, opacity }) => (
  <svg width={64} height={70} viewBox="0 0 64 70" style={{ position: "absolute", left: NODE_X - 32, top: y - 38, opacity }}>
    <path d="M22 14 v-4 a10 10 0 0 1 20 0 v4" fill="none" stroke={colors.honey} strokeWidth={5} strokeLinecap="round" />
    <rect x={6} y={14} width={52} height={50} rx={12} fill={colors.honey} stroke="#fff" strokeWidth={4} />
    <rect x={16} y={34} width={32} height={16} rx={5} fill={colors.honeySoft} />
  </svg>
);

export default Cover;
