import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « apres-le-diagnostic-tdah-parcours-de-soins ».
// Un chemin vertical en 6 étapes : un repère descend doucement d'une étape à
// l'autre, chaque étape s'allume à son passage. Les deux premières (école et
// MDPH) portent la mention « Cette semaine ». Tout se range et le cycle reprend.
//
// Boucle parfaite : l'état ne dépend que de `story` (0 → 60), décalé (OFFSET)
// pour que la première image, l'affiche JPG, montre le chemin entier allumé.

const OFFSET = 44;

const STEPS = [
  { label: "Informer l'école", when: "Cette semaine" },
  { label: "Dossier MDPH", when: "Cette semaine" },
  { label: "Pédopsychiatre", when: "Mois 1 à 2" },
  { label: "Psychologue TCC", when: "Mois 2 à 3" },
  { label: "Orthophoniste", when: "Si besoin" },
  { label: "Psychomotricien·ne, ergothérapeute", when: "Si besoin" },
];

const FIRST_Y = 412; // centre de la première étape
const GAP = 104; // entre deux étapes
const LINE_X = 100;
const CARD = { left: 150, right: 56, height: 84 };
const REACH = [4, 9, 14, 19, 24, 29]; // passage du repère à chaque étape, en pas
const RESET = [48, 55]; // tout se range

const rowY = (i: number) => FIRST_Y + i * GAP;

const Cover: React.FC = () => {
  const { story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  // Le repère glisse d'une étape à la suivante, sans rebond.
  const pos = REACH.reduce((acc, t, i) => (i === 0 ? acc : acc + ramp(story, REACH[i - 1] + 1, t)), 0);
  const markerY = interpolate(pos, [0, STEPS.length - 1], [rowY(0), rowY(STEPS.length - 1)]);
  const marker = ramp(story, 1, 4) * keep;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Parcours de soins" title={"Après le diagnostic\u00a0: 6 étapes"} subtitle="À votre rythme. L'école et la MDPH d'abord." />

      <svg width={928} height={1152} style={{ position: "absolute", inset: 0 }}>
        {/* Chemin : pointillé discret, puis trait plein derrière le repère */}
        <line x1={LINE_X} x2={LINE_X} y1={rowY(0)} y2={rowY(STEPS.length - 1)} stroke={colors.line} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
        <line x1={LINE_X} x2={LINE_X} y1={rowY(0)} y2={rowY(0) + (markerY - rowY(0)) * keep} stroke={colors.teal} strokeWidth={4} strokeLinecap="round" opacity={keep} />
        {/* Crochet « cette semaine » autour des étapes 1 et 2 */}
        <path
          d={`M${LINE_X - 38} ${rowY(0) - 30} h-10 v${GAP + 60} h10`}
          fill="none"
          stroke={colors.honey}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={ramp(story, REACH[1], REACH[1] + 4) * keep}
        />
      </svg>

      {STEPS.map((step, i) => (
        <Step key={step.label} index={i} story={story} keep={keep} />
      ))}

      {/* Repère : l'anneau qui parcourt le chemin */}
      <svg width={60} height={60} style={{ position: "absolute", left: LINE_X - 30, top: markerY - 30, opacity: marker }}>
        <circle cx={30} cy={30} r={26} fill="none" stroke={colors.teal} strokeWidth={3} />
        <circle cx={30} cy={30} r={26} fill={colors.teal} opacity={0.12} />
      </svg>

      <CoverFooter sources="sources Barkley, HAS, INSERM" />
    </AbsoluteFill>
  );
};

const Step: React.FC<{ index: number; story: number; keep: number }> = ({ index, story, keep }) => {
  const lit = ramp(story, REACH[index] - 1, REACH[index] + 2) * keep;
  const { label, when } = STEPS[index];
  const soon = when === "Cette semaine";
  const y = rowY(index);
  return (
    <>
      {/* Pastille numérotée sur le chemin */}
      <div
        style={{
          position: "absolute",
          left: LINE_X - 20,
          top: y - 20,
          width: 40,
          height: 40,
          borderRadius: 999,
          background: interpolateColors(lit, [0, 1], [colors.cream, colors.teal]),
          border: `2px solid ${interpolateColors(lit, [0, 1], [colors.line, colors.teal])}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 700,
          color: interpolateColors(lit, [0, 1], [colors.inkSoft, colors.cream]),
        }}
      >
        {index + 1}
      </div>
      <div
        style={{
          position: "absolute",
          left: CARD.left,
          right: CARD.right,
          top: y - CARD.height / 2,
          height: CARD.height,
          transform: `translateX(${-10 * (1 - lit)}px)`,
          background: "#fff",
          borderRadius: 22,
          border: `2px solid ${interpolateColors(lit, [0, 1], [colors.line, colors.teal])}`,
          boxShadow: `0 14px 30px rgba(53,136,145,${0.04 + 0.1 * lit})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "0 18px 0 26px",
          boxSizing: "border-box",
          opacity: 0.55 + 0.45 * lit,
        }}
      >
        <span style={{ fontSize: index === 5 ? 24 : 28, fontWeight: 600, lineHeight: 1.15 }}>{label}</span>
        <span
          style={{
            flexShrink: 0,
            fontSize: 22,
            fontWeight: 700,
            padding: "8px 16px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            background: soon ? colors.honeySoft : colors.tealSoft,
            color: soon ? colors.ink : colors.teal,
          }}
        >
          {when}
        </span>
      </div>
    </>
  );
};

export default Cover;
