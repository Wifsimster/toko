import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « parent-tdah-gerer-mes-propres-crises ». La
// respiration carrée : un point fait le tour d'un carré (inspirez, bloquez,
// expirez, bloquez) pendant qu'un cercle se gonfle, tient, se vide, tient. En
// dessous, un mantra de sortie. Le point fait exactement un tour par boucle :
// l'image 0 et l'image 240 sont identiques, et tout est déjà visible dès l'affiche.

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 40px ${fonts.heading}`, "Ce n'est pas contre moi").then(() => continueRender(italicHandle));

const SQ = { left: 284, top: 440, size: 360 };
const SIDES = ["Inspirez", "Bloquez", "Expirez", "Bloquez"];
const R_MIN = 62;
const R_MAX = 124;

const Cover: React.FC = () => {
  const { s } = useLoop(0);
  const side = Math.floor(s / 15) % 4;
  const t = ramp(s - side * 15, 1, 14); // progression sur le côté, avec une courte pause aux coins
  const { x, y } = pointOn(side, t);
  const breath = side === 0 ? t : side === 1 ? 1 : side === 2 ? 1 - t : 0;
  const r = R_MIN + (R_MAX - R_MIN) * breath;
  const cx = SQ.left + SQ.size / 2;
  const cy = SQ.top + SQ.size / 2;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Parent TDAH" title="Gérer mes propres crises" subtitle="La co-régulation commence par moi." />

      <svg width={928} height={1152} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill={colors.tealSoft} stroke={colors.teal} strokeOpacity={0.35} strokeWidth={3} />
        <rect x={SQ.left} y={SQ.top} width={SQ.size} height={SQ.size} rx={18} fill="none" stroke={colors.line} strokeWidth={6} />
        <Trace side={side} t={t} fade={1 - ramp(s - side * 15, 13.5, 15)} />
        <circle cx={x} cy={y} r={17} fill={colors.honey} stroke="#fff" strokeWidth={5} />
      </svg>

      {SIDES.map((label, i) => (
        <SideLabel key={i} index={i} text={label} active={emphasis(s, i)} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 104,
          right: 104,
          top: 884,
          height: 76,
          borderRadius: 22,
          background: "#fff",
          border: `2px solid ${colors.line}`,
          boxShadow: "0 14px 30px rgba(31,41,55,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fonts.heading,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 34,
        }}
      >
        « Ce n'est pas contre moi. »
      </div>

      <CoverFooter sources="source Dr Jill Bolte Taylor" />
    </AbsoluteFill>
  );
};

// Coins dans le sens des aiguilles d'une montre, en partant d'en haut à gauche.
const CORNERS = [
  [SQ.left, SQ.top],
  [SQ.left + SQ.size, SQ.top],
  [SQ.left + SQ.size, SQ.top + SQ.size],
  [SQ.left, SQ.top + SQ.size],
];

const pointOn = (side: number, t: number) => {
  const [x0, y0] = CORNERS[side];
  const [x1, y1] = CORNERS[(side + 1) % 4];
  return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t };
};

// Le côté en cours se colore derrière le point.
const Trace: React.FC<{ side: number; t: number; fade: number }> = ({ side, t, fade }) => {
  const [x0, y0] = CORNERS[side];
  const { x, y } = pointOn(side, t);
  return <line x1={x0} y1={y0} x2={x} y2={y} stroke={colors.teal} strokeWidth={6} strokeLinecap="round" opacity={fade} />;
};

// Le libellé du côté en cours passe en teal, sans à-coup aux coins.
const emphasis = (s: number, i: number) => {
  const one = (local: number) => ramp(local, -1, 1) * (1 - ramp(local, 14, 16));
  const local = s - i * 15;
  return Math.max(one(local), one(local - 60), one(local + 60)); // continu au raccord de la boucle
};

const SideLabel: React.FC<{ index: number; text: string; active: number }> = ({ index, text, active }) => {
  const mid = SQ.top + SQ.size / 2 - 18;
  const place =
    index === 0
      ? { left: SQ.left, width: SQ.size, top: SQ.top - 52, textAlign: "center" as const }
      : index === 1
        ? { left: SQ.left + SQ.size + 26, top: mid }
        : index === 2
          ? { left: SQ.left, width: SQ.size, top: SQ.top + SQ.size + 16, textAlign: "center" as const }
          : { left: 64, width: SQ.left - 64 - 26, top: mid, textAlign: "right" as const };
  // Deux couches superposées : gris doux, puis teal en fondu.
  return (
    <>
      <div style={{ position: "absolute", ...place, fontSize: 28, fontWeight: 700, color: colors.inkSoft, opacity: 0.8 }}>{text}</div>
      <div style={{ position: "absolute", ...place, fontSize: 28, fontWeight: 700, color: colors.teal, opacity: active }}>{text}</div>
    </>
  );
};

export default Cover;
