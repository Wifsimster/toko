import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « fonctions-executives-tdah-enfant ».
// Une consigne en trois parties arrive d'un coup : les trois objets s'empilent
// sur le plateau de la mémoire de travail, le troisième glisse et s'efface.
// À côté, la même consigne fragmentée : une action à la fois, cochée l'une
// après l'autre. Tout se range doucement et le cycle reprend.

const OFFSET = 44;
const RESET = [48, 55];

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 30px ${fonts.heading}`, "Va chercher ton cartable").then(() => continueRender(italicHandle));

const ITEMS = ["Cartable", "Chaussures", "Manteau"];
const DROP_START = [6, 9, 12];
const SLIP = [17, 23];

const STEPS = ["Ton cartable", "Tes chaussures", "Ton manteau"];
const STEP_START = [25, 31, 37];

const TRAY = { left: 56, top: 456, width: 384, height: 500 };
const LIST = { left: 470, top: 456, width: 402, height: 500 };
const CHIP = { width: 260, height: 60, left: 62 };
const STACK_Y = [340, 272, 204]; // haut de chaque objet empilé, dans le plateau

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  const float = Math.sin((2 * Math.PI * s) / 60) * 4;
  const bubble = ramp(story, 1, 5);

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Fonctions exécutives" title="L'enfant qui oublie tout" subtitle="Ce n'est pas de la mauvaise volonté." />

      <div
        style={{
          position: "absolute",
          left: 56,
          width: 816,
          top: 300,
          padding: "20px 32px",
          boxSizing: "border-box",
          background: "#fff",
          border: `2px solid ${colors.line}`,
          borderRadius: "24px 24px 24px 6px",
          boxShadow: "0 14px 30px rgba(31,41,55,0.06)",
          fontFamily: fonts.heading,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 30,
          lineHeight: 1.3,
          opacity: bubble * keep,
          transform: `translateY(${10 * (1 - bubble) + 14 * (1 - keep)}px)`,
        }}
      >
        « Va chercher ton cartable, tes chaussures et ton manteau. »
      </div>

      <Panel box={TRAY} title="Sa mémoire de travail" float={float}>
        <svg width={TRAY.width} height={TRAY.height} style={{ position: "absolute", inset: 0 }}>
          <path d="M40 408 L344 408 L318 440 L66 440 Z" fill={colors.honeySoft} stroke={colors.honey} strokeWidth={2.5} strokeLinejoin="round" />
        </svg>
        {ITEMS.map((label, i) => {
          const land = ramp(story, DROP_START[i], DROP_START[i] + 3) * keep;
          const last = i === ITEMS.length - 1;
          const slip = last ? ramp(story, SLIP[0], SLIP[1]) : 0;
          return (
            <div
              key={label}
              style={{
                position: "absolute",
                left: CHIP.left,
                top: STACK_Y[i],
                width: CHIP.width,
                height: CHIP.height,
                transform: `translate(${60 * slip}px, ${-50 * (1 - land) + 40 * slip}px) rotate(${10 * slip}deg)`,
                opacity: land * (1 - slip),
                background: "#fff",
                border: `2px solid ${colors.honey}`,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          );
        })}
        {/* Trace de l'objet oublié */}
        <div
          style={{
            position: "absolute",
            left: CHIP.left,
            top: STACK_Y[2],
            width: CHIP.width,
            height: CHIP.height,
            boxSizing: "border-box",
            border: `2px dashed ${colors.inkSoft}`,
            borderRadius: 16,
            opacity: 0.6 * ramp(story, SLIP[0] + 2, SLIP[1]) * keep,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 700,
            color: colors.inkSoft,
          }}
        >
          ?
        </div>
      </Panel>

      <Panel box={LIST} title="Une action à la fois" float={-float}>
        {STEPS.map((label, i) => {
          const t = STEP_START[i];
          const enter = ramp(story, t, t + 3) * keep;
          const done = ramp(story, t + 3, t + 6) * keep;
          return (
            <div
              key={label}
              style={{
                position: "absolute",
                left: 28,
                right: 28,
                top: 110 + i * 120,
                height: 84,
                opacity: 0.35 + 0.65 * enter,
                background: "#fff",
                borderRadius: 20,
                border: `2px solid ${enter > 0.5 ? colors.teal : colors.line}`,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "0 18px",
                boxSizing: "border-box",
              }}
            >
              <Step n={i + 1} done={done} />
              <span style={{ fontSize: 27, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
            </div>
          );
        })}
      </Panel>

      <CoverFooter sources="sources Barkley, HAS, INSERM" />
    </AbsoluteFill>
  );
};

const Panel: React.FC<{ box: typeof TRAY; title: string; float: number; children: React.ReactNode }> = ({ box, title, float, children }) => (
  <div
    style={{
      position: "absolute",
      ...box,
      transform: `translateY(${float}px)`,
      background: "#fff",
      borderRadius: 24,
      border: `2px solid ${colors.line}`,
      boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", top: 30, left: 30, fontSize: 22, fontWeight: 700, letterSpacing: 1.5, color: colors.teal, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {title}
    </div>
    {children}
  </div>
);

// Pastille numérotée qui devient une coche.
const Step: React.FC<{ n: number; done: number }> = ({ n, done }) => (
  <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
    <rect x={1} y={1} width={50} height={50} rx={14} fill={colors.tealSoft} stroke={colors.teal} strokeWidth={2} />
    <text x={26} y={35} textAnchor="middle" fontFamily={fonts.sans} fontSize={24} fontWeight={700} fill={colors.teal} opacity={Math.max(0, 1 - 3 * done)}>
      {n}
    </text>
    <path
      d="M15 27 l8 8 l14 -17"
      fill="none"
      stroke={colors.teal}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={40}
      strokeDashoffset={40 * (1 - done)}
    />
  </svg>
);

export default Cover;
