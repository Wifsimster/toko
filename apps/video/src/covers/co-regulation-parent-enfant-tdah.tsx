import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender, interpolateColors } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « co-regulation-parent-enfant-tdah ».
// Deux tracés respirent l'un sous l'autre : celui du parent, calme ; celui de
// l'enfant, agité, qui s'apaise jusqu'à suivre le premier pendant que trois
// phrases ultra-courtes se posent. Puis tout se range et le cycle reprend.

const OFFSET = 44;
const RESET = [48, 53];

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 30px ${fonts.heading}`, "Je suis là").then(() => continueRender(italicHandle));

const CARD = { left: 56, top: 356, width: 816, height: 340 };
const WAVE = { x0: 220, x1: 776, parentY: 98, childY: 246 };

const PHRASES = ["« Je suis là. »", "« Je ne pars pas. »", "« On est ensemble. »"];
const PHRASE_START = [9, 15, 21];
const PHRASE_Y = [772, 854, 936];

const TAU = 2 * Math.PI;
// Respiration calme : une longue ondulation, deux cycles par boucle.
const calm = (x: number, s: number) => 22 * Math.sin((TAU * (x - WAVE.x0)) / 280 - (TAU * 2 * s) / 60);
// Agitation : trois ondulations rapides, chacune un nombre entier de cycles par boucle.
const agitation = (x: number, s: number) =>
  24 * Math.sin((TAU * x) / 70 + (TAU * 3 * s) / 60) +
  15 * Math.sin((TAU * x) / 41 - (TAU * 5 * s) / 60) +
  9 * Math.sin((TAU * x) / 23 + (TAU * 7 * s) / 60);

const wavePath = (cy: number, fn: (x: number) => number) => {
  let d = "";
  for (let x = WAVE.x0; x <= WAVE.x1; x += 4) d += `${x === WAVE.x0 ? "M" : "L"}${x} ${(cy + fn(x)).toFixed(1)} `;
  return d;
};

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  // 1 = en alerte, 0 = apaisé. Remonte doucement après le rangement, pour boucler.
  const alert = Math.max(1 - ramp(story, 3, 22), ramp(story, 50, 58));
  const childColor = interpolateColors(alert, [0, 1], [colors.teal, colors.honey]);

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Co-régulation" title="Co-réguler avant de corriger" subtitle="Un système nerveux calme en apaise un autre." />

      <div
        style={{
          position: "absolute",
          ...CARD,
          background: "#fff",
          borderRadius: 24,
          border: `2px solid ${colors.line}`,
          boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
        }}
      >
        <svg width={CARD.width} height={CARD.height} style={{ position: "absolute", inset: 0 }}>
          <line x1={36} x2={780} y1={172} y2={172} stroke={colors.line} strokeWidth={2} strokeDasharray="6 8" />
          <path d={wavePath(WAVE.parentY, (x) => calm(x, s))} fill="none" stroke={colors.teal} strokeWidth={6} strokeLinecap="round" />
          <path
            d={wavePath(WAVE.childY, (x) => calm(x, s) + alert * agitation(x, s))}
            fill="none"
            stroke={childColor}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Label y={WAVE.parentY} text="Vous" />
        <Label y={WAVE.childY} text="Votre enfant" />
      </div>

      {PHRASES.map((text, i) => {
        const t = PHRASE_START[i];
        const enter = ramp(story, t, t + 4);
        return (
          <div
            key={text}
            style={{
              position: "absolute",
              left: 56 + i * 90,
              top: PHRASE_Y[i] - 34,
              height: 68,
              padding: "0 32px",
              display: "flex",
              alignItems: "center",
              transform: `translate(${-30 * (1 - enter)}px, ${14 * (1 - keep)}px)`,
              opacity: enter * keep,
              background: colors.tealSoft,
              border: `2px solid ${colors.teal}`,
              borderRadius: "24px 24px 24px 6px",
              fontFamily: fonts.heading,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 32,
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        );
      })}

      <CoverFooter sources="sources Barkley (programme PEHP)" />
    </AbsoluteFill>
  );
};

const Label: React.FC<{ y: number; text: string }> = ({ y, text }) => (
  <div style={{ position: "absolute", left: 36, top: y - 16, fontSize: 24, fontWeight: 700, color: colors.inkSoft, whiteSpace: "nowrap" }}>
    {text}
  </div>
);

export default Cover;
