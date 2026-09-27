import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « mini-guide-parrains-marraines-tdah ». Une
// grande bulle d'oxygène respire doucement autour d'un seul rituel, le goûter
// crêpes du dimanche. À côté, les transitions sont prévenues (10 minutes, puis
// 5), puis un message rassurant part vers les parents. Tout se range et le
// cycle reprend.
//
// Boucle parfaite : l'état ne dépend que de `story` (0 → 60), décalé (OFFSET)
// pour que la première image, l'affiche JPG, montre l'état complet.

const OFFSET = 44;

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 40px ${fonts.heading}`, "Tout s'est").then(() => continueRender(italicHandle));

const BUBBLE = { cx: 250, cy: 640, r: 196 };
const COL = { left: 488, width: 384 };

const MESSAGES = [
  { top: 420, text: "« Dans 10 minutes, on part. »", start: 6 },
  { top: 530, text: "« Dans 5 minutes, on range. »", start: 13 },
];
const PARENTS = 21; // message aux parents
const ONE = 30; // rappel « une activité à la fois »
const RESET = [48, 55]; // tout se range

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  // La bulle respire : un souffle entier par boucle.
  const breath = Math.sin((2 * Math.PI * s) / 60);

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader
        kicker="Mini-guide · parrains, marraines"
        title="Être le parrain cool d'un enfant TDAH"
        subtitle="Une bulle d'oxygène, sans enjeu."
      />

      <OxygenBubble breath={breath} phase={s / 60} story={story} keep={keep} />

      {MESSAGES.map((m) => (
        <Message key={m.text} {...m} story={story} keep={keep} />
      ))}
      <ToParents story={story} keep={keep} />
      <OneThing story={story} keep={keep} />

      <CoverFooter sources="sources Barkley, HAS, INSERM" />
    </AbsoluteFill>
  );
};

const OxygenBubble: React.FC<{ breath: number; phase: number; story: number; keep: number }> = ({ breath, phase, story, keep }) => {
  const plate = ramp(story, 0, 5) * keep;
  const r = BUBBLE.r + breath * 6;
  return (
    <>
      <svg width={928} height={1152} style={{ position: "absolute", inset: 0 }}>
        <circle cx={BUBBLE.cx} cy={BUBBLE.cy} r={r} fill="#fff" stroke={colors.teal} strokeWidth={3} />
        <circle cx={BUBBLE.cx} cy={BUBBLE.cy} r={r - 16} fill={colors.tealSoft} opacity={0.55} />
        {/* Reflet de bulle */}
        <path
          d={`M${BUBBLE.cx - r * 0.62} ${BUBBLE.cy - r * 0.34} A${r * 0.72} ${r * 0.72} 0 0 1 ${BUBBLE.cx - r * 0.2} ${BUBBLE.cy - r * 0.7}`}
          fill="none"
          stroke="#fff"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Petites bulles qui montent, cycliques */}
        {[0, 1, 2].map((k) => {
          const p = (2 * phase + k / 3) % 1; // deux montées par boucle
          return (
            <circle
              key={k}
              cx={BUBBLE.cx + 150 + k * 18}
              cy={BUBBLE.cy - 170 - p * 50}
              r={8 - k * 2}
              fill="none"
              stroke={colors.teal}
              strokeWidth={2}
              opacity={Math.sin(Math.PI * p) * 0.8}
            />
          );
        })}
        {/* Pile de crêpes sur une assiette */}
        <g opacity={plate} transform={`translate(0 ${10 * (1 - plate)})`}>
          <ellipse cx={BUBBLE.cx} cy={BUBBLE.cy - 18} rx={96} ry={24} fill="#fff" stroke={colors.line} strokeWidth={3} />
          {[0, 1, 2].map((k) => (
            <ellipse
              key={k}
              cx={BUBBLE.cx}
              cy={BUBBLE.cy - 26 - k * 12}
              rx={70 - k * 4}
              ry={15}
              fill={colors.honeySoft}
              stroke={colors.honey}
              strokeWidth={2}
            />
          ))}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: BUBBLE.cx - 170,
          width: 340,
          top: BUBBLE.cy + 30,
          textAlign: "center",
          opacity: plate,
        }}
      >
        <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 34, lineHeight: 1.1 }}>Un rituel à vous</div>
        <div style={{ marginTop: 8, fontSize: 22, fontWeight: 600, color: colors.inkSoft, lineHeight: 1.3 }}>
          Le goûter crêpes
          <br />
          du dimanche
        </div>
      </div>
    </>
  );
};

const Tail: React.FC<{ side: "left" | "right"; fill: string; stroke?: string }> = ({ side, fill, stroke }) => (
  <svg
    width={30}
    height={22}
    viewBox="0 0 30 22"
    style={{ position: "absolute", bottom: -19, [side]: 30, transform: side === "right" ? "scaleX(-1)" : undefined }}
  >
    <path d="M2 0 L4 20 L26 0" fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
    <rect x={0} y={0} width={30} height={3} fill={fill} />
  </svg>
);

const Message: React.FC<{ top: number; text: string; start: number; story: number; keep: number }> = ({
  top,
  text,
  start,
  story,
  keep,
}) => {
  const enter = ramp(story, start, start + 4);
  return (
    <div
      style={{
        position: "absolute",
        left: COL.left,
        top,
        width: COL.width,
        height: 76,
        transform: `translate(${-40 * (1 - enter)}px, ${14 * (1 - keep)}px) scale(${0.94 + 0.06 * enter})`,
        transformOrigin: "left center",
        opacity: enter * keep,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        boxSizing: "border-box",
        background: "#fff",
        border: `2px solid ${colors.line}`,
        borderRadius: 22,
        boxShadow: "0 12px 28px rgba(31,41,55,0.06)",
        fontFamily: fonts.heading,
        fontStyle: "italic",
        fontWeight: 500,
        fontSize: 27,
        whiteSpace: "nowrap",
      }}
    >
      {text}
      <Tail side="left" fill="#fff" stroke={colors.line} />
    </div>
  );
};

const ToParents: React.FC<{ story: number; keep: number }> = ({ story, keep }) => {
  const enter = ramp(story, PARENTS, PARENTS + 5);
  const opacity = enter * keep;
  return (
    <>
      <div style={{ position: "absolute", left: COL.left, width: COL.width, top: 648, textAlign: "right", fontSize: 22, fontWeight: 700, color: colors.inkSoft, opacity }}>
        Message à ses parents
      </div>
      <div
        style={{
          position: "absolute",
          left: COL.left,
          top: 690,
          width: COL.width,
          transform: `translate(${40 * (1 - enter)}px, ${14 * (1 - keep)}px) scale(${0.94 + 0.06 * enter})`,
          transformOrigin: "right center",
          opacity,
          padding: "20px 28px",
          boxSizing: "border-box",
          background: colors.teal,
          color: colors.cream,
          borderRadius: 24,
          boxShadow: "0 14px 30px rgba(53,136,145,0.2)",
          fontFamily: fonts.heading,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 32,
          lineHeight: 1.2,
        }}
      >
        « Tout s'est super bien passé. »
        <Tail side="right" fill={colors.teal} />
      </div>
    </>
  );
};

const OneThing: React.FC<{ story: number; keep: number }> = ({ story, keep }) => {
  const enter = ramp(story, ONE, ONE + 4);
  return (
    <div
      style={{
        position: "absolute",
        left: COL.left,
        width: COL.width,
        top: 884,
        height: 62,
        transform: `translateY(${16 * (1 - enter) + 14 * (1 - keep)}px)`,
        opacity: enter * keep,
        borderRadius: 999,
        background: colors.honeySoft,
        border: `2px solid ${colors.honey}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        fontSize: 24,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <svg width={24} height={24} viewBox="0 0 24 24">
        <circle cx={12} cy={12} r={10} fill="none" stroke={colors.honey} strokeWidth={2.5} />
        <circle cx={12} cy={12} r={4} fill={colors.honey} />
      </svg>
      Une activité à la fois
    </div>
  );
};

export default Cover;
