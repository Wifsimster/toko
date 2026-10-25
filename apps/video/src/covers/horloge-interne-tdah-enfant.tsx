import { AbsoluteFill, interpolateColors } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « horloge-interne-tdah-enfant ». Un cadran sans
// chiffres : un repère miel marque l'heure de la maison, l'aiguille à la lune
// (son horloge) est réglée plus tard. À chaque piste qui arrive (réveil fixe,
// lumière du matin, moins de lumière le soir, repères réguliers), l'aiguille
// recule d'un cran vers le repère ; avec la lumière du jour, un soleil se lève
// dans le bas du cadran. Puis tout se range, l'aiguille repart plus tard et le
// cycle reprend.
//
// Boucle parfaite : l'état ne dépend que de `story` (0 → 60), décalé (OFFSET)
// pour que la première image, l'affiche JPG, montre l'état complet.

const OFFSET = 44;
const START = [4, 11, 18, 25]; // arrivée de chaque piste, en pas (60 par boucle)
const RESET = [48, 55]; // tout se range

const DIAL = { cx: 464, cy: 568, r: 158 };
// Angles en degrés, depuis midi, sens horaire.
const HOUSE = -28; // l'heure de la maison
const LATE = 62; // son horloge, réglée plus tard
const CLOSE = -14; // après les pistes : plus près de la maison

const PISTES = [
  { title: "Même heure de réveil", sub: "Week-end compris", icon: "alarm" },
  { title: "Lumière du jour", sub: "Dès le matin", icon: "sun" },
  { title: "Moins de lumière", sub: "Le soir", icon: "lamp" },
  { title: "Repères réguliers", sub: "Dans la journée", icon: "plate" },
] as const;

const CARD = { width: 396, height: 96, left: [60, 472], top: [770, 880] };

const polar = (deg: number, radius: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: DIAL.cx + radius * Math.sin(a), y: DIAL.cy - radius * Math.cos(a) };
};

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  // L'aiguille recule d'un quart du chemin par piste.
  const pull = (START.reduce((acc, t) => acc + ramp(story, t + 2, t + 8), 0) / START.length) * keep;
  const hand = LATE + (CLOSE - LATE) * pull;
  const sunrise = ramp(story, START[1] + 1, START[1] + 8) * keep;
  const float = Math.sin((2 * Math.PI * s) / 60) * 3;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader
        kicker="Horloge interne et TDAH"
        title="Pourquoi votre enfant n'a pas sommeil le soir"
        subtitle="Son horloge n'est pas à la même heure que la maison."
      />

      <Legend />
      <Dial hand={hand} sunrise={sunrise} float={float} />

      {PISTES.map((p, i) => (
        <PisteCard key={p.title} index={i} story={story} keep={keep} />
      ))}

      <CoverFooter sources="sources Frontiers 2025, Hiscock et al. BMJ 2015, HAS 2024" />
    </AbsoluteFill>
  );
};

const Legend: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 64, top: DIAL.cy - 104, width: 200, display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ width: 34, height: 8, borderRadius: 4, background: colors.honey }} />
      <span style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2 }}>L'heure de la maison</span>
    </div>
    <div style={{ position: "absolute", right: 64, top: DIAL.cy - 104, width: 200, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, textAlign: "right" }}>
      <span style={{ width: 34, height: 8, borderRadius: 4, background: colors.teal }} />
      <span style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2, color: colors.teal }}>Son horloge</span>
    </div>
  </>
);

const Dial: React.FC<{ hand: number; sunrise: number; float: number }> = ({ hand, sunrise, float }) => {
  const { cx, cy, r } = DIAL;
  const house = polar(HOUSE, r - 6);
  const houseIn = polar(HOUSE, r - 40);
  const tip = polar(hand, r - 46);
  // Arc du décalage, entre l'heure de la maison et l'aiguille.
  const arcA = polar(HOUSE, r - 20);
  const arcB = polar(hand, r - 20);
  const large = hand - HOUSE > 180 ? 1 : 0;
  // Bas du cadran : l'horizon, où le soleil se lève.
  const horizon = cy + 70;
  const sunY = horizon + 40 - 62 * sunrise;
  const glow = interpolateColors(sunrise, [0, 1], [colors.tealSoft, colors.honeySoft]);
  return (
    <svg
      width={2 * r + 40}
      height={2 * r + 40}
      viewBox={`${cx - r - 20} ${cy - r - 20} ${2 * r + 40} ${2 * r + 40}`}
      style={{ position: "absolute", left: cx - r - 20, top: cy - r - 20, transform: `translateY(${float}px)`, overflow: "visible" }}
    >
      <defs>
        <clipPath id="horloge-face">
          <circle cx={cx} cy={cy} r={r - 3} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={colors.line} strokeWidth={3} />
      <g clipPath="url(#horloge-face)">
        <rect x={cx - r} y={horizon} width={2 * r} height={r} fill={glow} />
        <circle cx={cx} cy={sunY} r={30} fill={colors.honey} opacity={sunrise} />
        {[-70, -50, -30, 30, 50, 70].map((dx) => (
          <line
            key={dx}
            x1={cx + dx * 0.72}
            x2={cx + dx}
            y1={sunY - 44 * (1 - Math.abs(dx) / 140)}
            y2={sunY - 62 * (1 - Math.abs(dx) / 140)}
            stroke={colors.honey}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={ramp(sunrise, 0.5, 1)}
          />
        ))}
        <rect x={cx - r} y={horizon} width={2 * r} height={3} fill={colors.line} />
      </g>
      {Array.from({ length: 12 }, (_, k) => {
        const a = polar(k * 30, r - 14);
        const b = polar(k * 30, r - (k % 3 === 0 ? 30 : 24));
        return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors.inkSoft} strokeOpacity={0.45} strokeWidth={k % 3 === 0 ? 4 : 3} strokeLinecap="round" />;
      })}
      <path
        d={`M${arcA.x} ${arcA.y} A${r - 20} ${r - 20} 0 ${large} 1 ${arcB.x} ${arcB.y}`}
        fill="none"
        stroke={colors.teal}
        strokeOpacity={0.28}
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* Repère miel : l'heure de la maison */}
      <line x1={house.x} y1={house.y} x2={houseIn.x} y2={houseIn.y} stroke={colors.honey} strokeWidth={10} strokeLinecap="round" />
      {/* Aiguille de son horloge, avec une petite lune au bout */}
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={colors.teal} strokeWidth={9} strokeLinecap="round" />
      <circle cx={tip.x} cy={tip.y} r={17} fill={colors.teal} />
      <circle cx={tip.x + 7} cy={tip.y - 6} r={13} fill="#fff" />
      <circle cx={cx} cy={cy} r={13} fill={colors.teal} />
      <circle cx={cx} cy={cy} r={5} fill="#fff" />
    </svg>
  );
};

const PisteCard: React.FC<{ index: number; story: number; keep: number }> = ({ index, story, keep }) => {
  const t = START[index];
  const enter = ramp(story, t, t + 4);
  const { title, sub, icon } = PISTES[index];
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left[index % 2],
        top: CARD.top[Math.floor(index / 2)],
        width: CARD.width,
        height: CARD.height,
        transform: `translate(0px, ${22 * (1 - enter) + 12 * (1 - keep)}px)`,
        opacity: enter * keep,
        background: "#fff",
        borderRadius: 24,
        border: `2px solid ${colors.teal}`,
        boxShadow: "0 12px 26px rgba(53,136,145,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 20px",
        boxSizing: "border-box",
      }}
    >
      <Icon kind={icon} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 25, fontWeight: 700, lineHeight: 1.2 }}>{title}</span>
        <span style={{ fontSize: 22, fontWeight: 600, color: colors.teal }}>{sub}</span>
      </div>
    </div>
  );
};

const Icon: React.FC<{ kind: (typeof PISTES)[number]["icon"] }> = ({ kind }) => (
  <svg width={48} height={48} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <rect x={1} y={1} width={46} height={46} rx={14} fill={colors.tealSoft} />
    <g fill="none" stroke={colors.teal} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      {kind === "alarm" && (
        <>
          <circle cx={24} cy={26} r={11} />
          <path d="M24 20 v6 l4 3 M13 15 l4 -3 M35 15 l-4 -3" />
        </>
      )}
      {kind === "sun" && (
        <>
          <circle cx={24} cy={24} r={7} />
          <path d="M24 10 v4 M24 34 v4 M10 24 h4 M34 24 h4 M14 14 l3 3 M31 31 l3 3 M34 14 l-3 3 M17 31 l-3 3" />
        </>
      )}
      {kind === "lamp" && (
        <>
          <path d="M17 14 h14 l4 12 h-22 Z" />
          <path d="M24 26 v8 M18 36 h12" />
        </>
      )}
      {kind === "plate" && (
        <>
          <circle cx={26} cy={24} r={10} />
          <path d="M12 12 v8 a2 2 0 0 0 4 0 v-8 M14 22 v14" />
        </>
      )}
    </g>
  </svg>
);

export default Cover;
