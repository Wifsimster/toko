import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « mediation-equine-equitation-tdah-enfant ».
// Sous un fer à cheval, deux fiches empilées (on les confond) se séparent :
// la médiation équine d'un côté (un soin), l'équitation de l'autre (un sport).
// Puis le rappel de l'article : un complément, jamais un remplacement du suivi.
// Les fiches se rempilent doucement et le cycle reprend. La première image
// (affiche) montre l'état complet.

const OFFSET = 44;
const RESET = [48, 55];
const SPLIT = [4, 13];
const TAGS = 13;
const NOTE = 27;

const CARD = { top: 548, width: 384, height: 268 };
const LEFT_X = 64;
const RIGHT_X = 928 - 64 - CARD.width;
const STACK_X = (928 - CARD.width) / 2;

const CARDS = [
  { title: "Médiation équine", tag: "Un soin", what: "Conduit par un professionnel formé", tone: colors.teal, soft: colors.tealSoft },
  { title: "Équitation", tag: "Un sport", what: "Encadré par un moniteur diplômé", tone: colors.honey, soft: colors.honeySoft },
];

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  const split = ramp(story, SPLIT[0], SPLIT[1]) * keep;
  const tags = ramp(story, TAGS, TAGS + 5) * keep;
  const note = ramp(story, NOTE, NOTE + 4) * keep;
  const sway = Math.sin((2 * Math.PI * s) / 60) * 3;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Enfant TDAH et cheval" title="Médiation équine ou équitation ?" subtitle="Soin d'un côté, sport de l'autre." />

      <Horseshoe sway={sway} />

      {/* L'équitation passe derrière quand les fiches sont empilées. */}
      <Card index={1} split={split} tags={tags} />
      <Card index={0} split={split} tags={tags} />

      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          top: 864,
          height: 68,
          transform: `translateY(${16 * (1 - note)}px)`,
          opacity: note,
          borderRadius: 999,
          background: colors.teal,
          color: colors.cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        Un complément, jamais un remplacement du suivi
      </div>

      <CoverFooter sources="sources IFCE, Société française d'équithérapie, FFE" />
    </AbsoluteFill>
  );
};

const Card: React.FC<{ index: number; split: number; tags: number }> = ({ index, split, tags }) => {
  const c = CARDS[index];
  const target = index === 0 ? LEFT_X : RIGHT_X;
  // Empilées : la fiche de derrière est décalée et légèrement tournée.
  const stackX = STACK_X + (index === 1 ? 22 : 0);
  const stackY = index === 1 ? 20 : 0;
  const x = stackX + (target - stackX) * split;
  const y = stackY * (1 - split);
  const rot = (index === 1 ? 2.5 : -1.5) * (1 - split);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: CARD.top + y,
        width: CARD.width,
        height: CARD.height,
        transform: `rotate(${rot}deg)`,
        background: "#fff",
        borderRadius: 26,
        border: `2px solid ${split > 0.5 ? c.tone : colors.line}`,
        boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
        boxSizing: "border-box",
        padding: "26px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 36, lineHeight: 1.1 }}>{c.title}</div>
      <div
        style={{
          alignSelf: "flex-start",
          padding: "8px 20px",
          borderRadius: 999,
          background: c.soft,
          border: `2px solid ${c.tone}`,
          fontSize: 26,
          fontWeight: 700,
          opacity: tags,
        }}
      >
        {c.tag}
      </div>
      <div style={{ fontSize: 26, lineHeight: 1.3, color: colors.inkSoft, opacity: tags }}>{c.what}</div>
    </div>
  );
};

// Fer à cheval miel, ouverture vers le bas, qui se balance à peine.
const Horseshoe: React.FC<{ sway: number }> = ({ sway }) => (
  <svg width={140} height={140} viewBox="0 0 140 140" style={{ position: "absolute", left: 464 - 70, top: 382, transform: `rotate(${sway}deg)` }}>
    <path d="M30 124 V70 a40 40 0 0 1 80 0 V124" fill="none" stroke={colors.honey} strokeWidth={26} strokeLinecap="round" />
    {[
      [30, 108],
      [30, 80],
      [42, 46],
      [98, 46],
      [110, 80],
      [110, 108],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={3.5} fill={colors.cream} />
    ))}
  </svg>
);

export default Cover;
