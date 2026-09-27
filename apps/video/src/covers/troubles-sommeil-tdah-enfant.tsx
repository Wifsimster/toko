import { AbsoluteFill, interpolateColors } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « troubles-sommeil-tdah-enfant ». Une fenêtre
// passe du soir à la nuit au rythme des quatre paliers de la routine du soir :
// à chaque palier, une carte arrive et le ciel s'assombrit d'un cran. La lune
// se lève, les étoiles et la lampe ambre s'allument, puis tout se range et le
// soir revient.
//
// Boucle parfaite : l'état ne dépend que de `story` (0 → 60), décalé (OFFSET)
// pour que la première image, l'affiche JPG, montre la nuit complète.

const OFFSET = 44;

const STEPS = [
  { when: "1 h 30 avant", what: "Arrêt total des écrans" },
  { when: "45 min avant", what: "Bain tiède" },
  { when: "30 min avant", what: "Histoire ou musique douce" },
  { when: "Au coucher", what: "Rituel court et stable" },
];

const ROW_Y = [476, 616, 756, 896]; // centres des cartes, en px de la couverture
const START = [4, 11, 18, 25]; // début de chaque palier, en pas (60 par boucle)
const RESET = [48, 55]; // tout se range

const WIN = { left: 56, top: 372, width: 404, height: 600 };
const PANE = { left: 28, top: 28, w: WIN.width - 56, h: 430 };
const CARD = { left: 492, width: 380, height: 116 };

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  // Avancée de la nuit : un quart par palier.
  const night = (START.reduce((acc, t) => acc + ramp(story, t + 2, t + 7), 0) / START.length) * keep;
  // Léger flottement de la fenêtre, un tour entier par boucle.
  const float = Math.sin((2 * Math.PI * s) / 60) * 4;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Sommeil et TDAH" title="Pourquoi mon enfant ne dort pas" subtitle="Une routine du soir en 4 paliers." />

      <NightWindow night={night} float={float} />

      {STEPS.map((step, i) => (
        <StepCard key={step.when} index={i} story={story} keep={keep} />
      ))}

      <CoverFooter sources="sources Barkley, HAS, INSERM" />
    </AbsoluteFill>
  );
};

const STARS = [
  [70, 96, 3],
  [150, 62, 2.5],
  [296, 118, 3],
  [262, 212, 2],
  [84, 250, 2.5],
  [318, 286, 2],
  [178, 150, 2],
];

// Arche de la fenêtre : demi-cercle en haut, droite en bas.
const ARCH = `M0 ${PANE.w / 2} A${PANE.w / 2} ${PANE.w / 2} 0 0 1 ${PANE.w} ${PANE.w / 2} V${PANE.h} H0 Z`;

const NightWindow: React.FC<{ night: number; float: number }> = ({ night, float }) => {
  const sky = interpolateColors(night, [0, 0.5, 1], [colors.honeySoft, colors.teal, colors.night]);
  const skyLow = interpolateColors(night, [0, 0.5, 1], [colors.cream, colors.tealSoft, colors.teal]);
  const roofs = interpolateColors(night, [0, 1], [colors.line, colors.night]);
  const moonY = 330 - 190 * night;
  const stars = ramp(night, 0.55, 1);
  const lamp = ramp(night, 0.6, 1);
  return (
    <div
      style={{
        position: "absolute",
        ...WIN,
        transform: `translateY(${float}px) rotate(-1.5deg)`,
        background: "#fff",
        borderRadius: 22,
        border: `2px solid ${colors.line}`,
        boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
        overflow: "hidden",
      }}
    >
      <svg width={PANE.w} height={PANE.h} style={{ position: "absolute", left: PANE.left, top: PANE.top }}>
        <defs>
          <linearGradient id="sommeil-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky} />
            <stop offset="1" stopColor={skyLow} />
          </linearGradient>
          <clipPath id="sommeil-arch">
            <path d={ARCH} />
          </clipPath>
          <mask id="sommeil-moon">
            <circle cx={236} cy={moonY} r={42} fill="#fff" />
            <circle cx={258} cy={moonY - 14} r={36} fill="#000" />
          </mask>
        </defs>
        <g clipPath="url(#sommeil-arch)">
          <rect width={PANE.w} height={PANE.h} fill="url(#sommeil-sky)" />
          {STARS.map(([x, y, r], k) => (
            <circle key={k} cx={x} cy={y} r={r} fill={colors.cream} opacity={stars * (0.6 + 0.2 * (k % 3))} />
          ))}
          {/* Lune : un croissant crème (disque échancré par un masque) */}
          <circle cx={236} cy={moonY} r={42} fill={colors.cream} opacity={0.35 + 0.65 * night} mask="url(#sommeil-moon)" />
          {/* Toits au loin */}
          <path
            d={`M0 ${PANE.h - 70} L70 ${PANE.h - 110} L140 ${PANE.h - 70} L200 ${PANE.h - 96} L270 ${PANE.h - 60} L${PANE.w} ${PANE.h - 88} V${PANE.h} H0 Z`}
            fill={roofs}
          />
        </g>
        {/* Croisillons */}
        <path d={ARCH} fill="none" stroke="#fff" strokeWidth={10} />
        <line x1={PANE.w / 2} x2={PANE.w / 2} y1={0} y2={PANE.h} stroke="#fff" strokeWidth={10} />
        <line x1={0} x2={PANE.w} y1={PANE.h * 0.55} y2={PANE.h * 0.55} stroke="#fff" strokeWidth={10} />
      </svg>

      {/* Rebord de fenêtre et lampe tamisée ambre, qui s'allume à la fin */}
      <svg width={WIN.width} height={130} style={{ position: "absolute", left: 0, top: PANE.top + PANE.h }}>
        <rect x={20} y={14} width={WIN.width - 40} height={10} rx={5} fill={colors.line} />
        <circle cx={78} cy={72} r={48} fill={colors.honey} opacity={0.2 * lamp} />
        <path d="M60 46 h36 l10 28 h-56 Z" fill={interpolateColors(lamp, [0, 1], [colors.line, colors.honey])} />
        <rect x={75} y={74} width={6} height={22} fill={colors.inkSoft} />
        <rect x={60} y={96} width={36} height={6} rx={3} fill={colors.inkSoft} />
      </svg>
      <div style={{ position: "absolute", left: 136, top: PANE.top + PANE.h + 58, fontSize: 22, fontWeight: 600, color: colors.inkSoft }}>
        Lampe tamisée ambre
      </div>
    </div>
  );
};

const StepCard: React.FC<{ index: number; story: number; keep: number }> = ({ index, story, keep }) => {
  const t = START[index];
  const enter = ramp(story, t, t + 4);
  const check = ramp(story, t + 3, t + 6);
  // Arrive depuis la fenêtre ; se range en glissant un peu vers le bas.
  const x = -60 * (1 - enter);
  const y = 14 * (1 - keep);
  const { when, what } = STEPS[index];
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left,
        top: ROW_Y[index] - CARD.height / 2,
        width: CARD.width,
        height: CARD.height,
        transform: `translate(${x}px, ${y}px) scale(${0.94 + 0.06 * enter})`,
        opacity: enter * keep,
        background: "#fff",
        borderRadius: 24,
        border: `2px solid ${colors.teal}`,
        boxShadow: "0 14px 30px rgba(53,136,145,0.14)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
      <Check progress={check} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: colors.teal }}>{when}</span>
        <span style={{ fontSize: 27, fontWeight: 600, lineHeight: 1.2 }}>{what}</span>
      </div>
    </div>
  );
};

const Check: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
    <rect x={1} y={1} width={50} height={50} rx={14} fill={colors.tealSoft} stroke={colors.teal} strokeWidth={2} />
    <path
      d="M15 27 l8 8 l14 -17"
      fill="none"
      stroke={colors.teal}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={40}
      strokeDashoffset={40 * (1 - progress)}
    />
  </svg>
);

export default Cover;
