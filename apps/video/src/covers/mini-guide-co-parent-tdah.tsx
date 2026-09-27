import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « mini-guide-co-parent-tdah ». Deux maisons,
// la même liste de 5 règles cardinales : chaque règle est cochée en même temps
// des deux côtés, un fil relie les deux lignes. Puis une observation factuelle
// est partagée dans une bulle. Tout se range et le cycle reprend.
//
// Boucle parfaite : l'état ne dépend que de `story` (0 → 60), décalé (OFFSET)
// pour que la première image, l'affiche JPG, montre l'état complet.

const OFFSET = 44;

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 40px ${fonts.heading}`, "Il n'a pas dormi").then(() => continueRender(italicHandle));

const RULES = ["Heure du coucher", "Temps d'écran", "Devoirs", "Non négociables", "Rituels d'apaisement"];

const HOUSE = { top: 404, width: 372, height: 440 };
const HOUSE_LEFT = [64, 492];
const ROW_TOP = 94; // première ligne, depuis le haut de la maison
const ROW_H = 66;
const START = [4, 9, 14, 19, 24]; // chaque règle est cochée, en pas (60 par boucle)
const NOTE = 31; // arrivée de l'observation partagée
const RESET = [48, 55]; // tout se range

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  // Les deux maisons flottent en miroir, un tour entier par boucle.
  const float = Math.sin((2 * Math.PI * s) / 60) * 4;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader
        kicker="Mini-guide · co-parents"
        title="Parler d'une seule voix, même séparés"
        subtitle="Cohérence, pas perfection."
      />

      <Threads story={story} keep={keep} />
      <House left={HOUSE_LEFT[0]} label="Chez l'un" story={story} keep={keep} float={float} />
      <House left={HOUSE_LEFT[1]} label="Chez l'autre" story={story} keep={keep} float={-float} />

      <Observation story={story} keep={keep} />

      <CoverFooter sources="sources Barkley, HAS, INSERM" />
    </AbsoluteFill>
  );
};

const House: React.FC<{ left: number; label: string; story: number; keep: number; float: number }> = ({
  left,
  label,
  story,
  keep,
  float,
}) => (
  <div style={{ position: "absolute", left, top: HOUSE.top, width: HOUSE.width, height: HOUSE.height, transform: `translateY(${float}px)` }}>
    {/* Toit */}
    <svg width={HOUSE.width} height={70} style={{ position: "absolute", top: -58, left: 0 }}>
      <path
        d={`M18 66 L${HOUSE.width / 2} 6 L${HOUSE.width - 18} 66`}
        fill="none"
        stroke={colors.teal}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#fff",
        borderRadius: 22,
        border: `2px solid ${colors.line}`,
        boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
      }}
    >
      <div style={{ position: "absolute", top: 30, left: 28, fontSize: 22, fontWeight: 700, color: colors.inkSoft }}>{label}</div>
      {RULES.map((rule, i) => {
        const done = ramp(story, START[i], START[i] + 4) * keep;
        return (
          <div
            key={rule}
            style={{
              position: "absolute",
              left: 24,
              right: 20,
              top: ROW_TOP + i * ROW_H,
              height: 52,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Check progress={done} />
            <span style={{ fontSize: 24, fontWeight: 600, whiteSpace: "nowrap", opacity: 0.55 + 0.45 * done }}>{rule}</span>
          </div>
        );
      })}
    </div>
  </div>
);

// Fils pointillés entre les deux maisons : une règle, la même des deux côtés.
const Threads: React.FC<{ story: number; keep: number }> = ({ story, keep }) => {
  const x1 = HOUSE_LEFT[0] + HOUSE.width - 6;
  const x2 = HOUSE_LEFT[1] + 6;
  return (
    <svg width={928} height={1152} style={{ position: "absolute", inset: 0 }}>
      {RULES.map((rule, i) => {
        const draw = ramp(story, START[i] + 1, START[i] + 5) * keep;
        const y = HOUSE.top + ROW_TOP + i * ROW_H + 26;
        return (
          <g key={rule} opacity={draw}>
            <line x1={x1} x2={x1 + (x2 - x1) * draw} y1={y} y2={y} stroke={colors.teal} strokeWidth={3} strokeDasharray="6 7" strokeLinecap="round" />
            <circle cx={(x1 + x2) / 2} cy={y} r={5} fill={colors.teal} opacity={ramp(draw, 0.6, 1)} />
          </g>
        );
      })}
    </svg>
  );
};

const Check: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={44} height={44} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
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

const Observation: React.FC<{ story: number; keep: number }> = ({ story, keep }) => {
  const enter = ramp(story, NOTE, NOTE + 5);
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        top: 876,
        transform: `translateY(${16 * (1 - enter) + 14 * (1 - keep)}px) scale(${0.96 + 0.04 * enter})`,
        opacity: enter * keep,
        padding: "16px 28px",
        boxSizing: "border-box",
        background: "#fff",
        border: `2px solid ${colors.teal}`,
        borderRadius: 24,
        boxShadow: "0 14px 30px rgba(53,136,145,0.14)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 700, color: colors.teal }}>Une observation, pas une interprétation</span>
      <span style={{ fontFamily: fonts.heading, fontStyle: "italic", fontWeight: 500, fontSize: 32 }}>
        « Il n'a pas dormi avant 23h vendredi. »
      </span>
      {/* Queue de bulle, centrée : le message part vers les deux maisons */}
      <svg width={30} height={22} viewBox="0 0 30 22" style={{ position: "absolute", bottom: -19, left: 60 }}>
        <path d="M2 0 L4 20 L26 0" fill="#fff" stroke={colors.teal} strokeWidth={2} strokeLinejoin="round" />
        <rect x={0} y={0} width={30} height={3} fill="#fff" />
      </svg>
    </div>
  );
};

export default Cover;
