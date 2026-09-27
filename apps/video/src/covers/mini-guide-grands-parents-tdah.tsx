import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « mini-guide-grands-parents-tdah ». Trois
// phrases à éviter de dire aux parents sont barrées l'une après l'autre, d'un
// trait miel ; la phrase qui aide arrive à leur place, puis le rappel « une
// présence calme vaut mille conseils ». Tout se range et le cycle reprend.
//
// Boucle parfaite : l'état ne dépend que de `story` (0 → 60), décalé (OFFSET)
// pour que la première image, l'affiche JPG, montre l'état complet.

const OFFSET = 44;

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 40px ${fonts.heading}`, "Qu'est-ce").then(() => continueRender(italicHandle));

const AVOID = ["« Tu devrais être plus ferme. »", "« Il fait ça pour t'embêter. »", "« C'est parce que tu travailles trop. »"];

const AVOID_TOP = [420, 512, 604]; // haut de chaque bulle, en px de la couverture
const START = [4, 10, 16]; // chaque phrase est barrée, en pas (60 par boucle)
const HELP = 22; // arrivée de la phrase qui aide
const CALM = 30; // arrivée du rappel
const RESET = [48, 55]; // tout se range

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  // Léger flottement des bulles, un tour entier par boucle.
  const float = Math.sin((2 * Math.PI * s) / 60) * 4;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader
        kicker="Mini-guide · grands-parents"
        title="Votre petit-enfant TDAH n'est pas mal élevé"
        subtitle="Sans jargon médical, sans jugement."
      />

      <Label top={374} left={64}>À éviter de dire à ses parents</Label>
      {AVOID.map((text, i) => (
        <AvoidBubble key={text} index={i} text={text} story={story} keep={keep} float={float} />
      ))}

      <HelpBubble story={story} keep={keep} />
      <Calm story={story} keep={keep} />

      <CoverFooter sources="sources Barkley, HAS, INSERM" />
    </AbsoluteFill>
  );
};

const Label: React.FC<{ top: number; left?: number; right?: number; opacity?: number; children: React.ReactNode }> = ({
  top,
  left,
  right,
  opacity = 1,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      right,
      opacity,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: 1,
      color: colors.inkSoft,
    }}
  >
    {children}
  </div>
);

// Petite queue de bulle, côté gauche ou droit.
const Tail: React.FC<{ side: "left" | "right"; fill: string; stroke?: string }> = ({ side, fill, stroke }) => (
  <svg
    width={30}
    height={22}
    viewBox="0 0 30 22"
    style={{ position: "absolute", bottom: -19, [side]: 34, transform: side === "right" ? "scaleX(-1)" : undefined }}
  >
    <path d="M2 0 L4 20 L26 0" fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
    <rect x={0} y={0} width={30} height={3} fill={fill} />
  </svg>
);

const AvoidBubble: React.FC<{ index: number; text: string; story: number; keep: number; float: number }> = ({
  index,
  text,
  story,
  keep,
  float,
}) => {
  const t = START[index];
  const strike = ramp(story, t, t + 4) * keep;
  const dim = 1 - 0.5 * ramp(story, t + 2, t + 6) * keep;
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: AVOID_TOP[index],
        transform: `translateY(${float * (index % 2 === 0 ? 1 : -1)}px)`,
        height: 70,
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        background: "#fff",
        border: `2px solid ${colors.line}`,
        borderRadius: 22,
        boxShadow: "0 12px 28px rgba(31,41,55,0.06)",
      }}
    >
      <span
        style={{
          position: "relative",
          fontFamily: fonts.heading,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 30,
          whiteSpace: "nowrap",
          opacity: dim,
        }}
      >
        {text}
        {/* Trait miel qui barre la phrase, tracé lentement de gauche à droite */}
        <span
          style={{
            position: "absolute",
            left: -6,
            top: "54%",
            height: 4,
            borderRadius: 2,
            width: `calc(${strike * 100}% + ${12 * strike}px)`,
            background: colors.honey,
          }}
        />
      </span>
      <Tail side="left" fill="#fff" stroke={colors.line} />
    </div>
  );
};

const HelpBubble: React.FC<{ story: number; keep: number }> = ({ story, keep }) => {
  const enter = ramp(story, HELP, HELP + 5);
  const opacity = enter * keep;
  return (
    <>
      <Label top={712} right={64} opacity={opacity}>
        À dire plutôt
      </Label>
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 752,
          width: 560,
          transform: `translate(${40 * (1 - enter)}px, ${14 * (1 - keep)}px) scale(${0.94 + 0.06 * enter})`,
          transformOrigin: "right center",
          opacity,
          padding: "22px 32px",
          boxSizing: "border-box",
          background: colors.teal,
          color: colors.cream,
          borderRadius: 26,
          boxShadow: "0 14px 30px rgba(53,136,145,0.2)",
          fontFamily: fonts.heading,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 36,
          lineHeight: 1.2,
        }}
      >
        « Qu'est-ce qui vous aiderait en ce moment ? »
        <Tail side="right" fill={colors.teal} />
      </div>
    </>
  );
};

const Calm: React.FC<{ story: number; keep: number }> = ({ story, keep }) => {
  const enter = ramp(story, CALM, CALM + 4);
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 930,
        height: 62,
        padding: "0 28px",
        transform: `translateY(${16 * (1 - enter) + 14 * (1 - keep)}px)`,
        opacity: enter * keep,
        borderRadius: 999,
        background: colors.honeySoft,
        border: `2px solid ${colors.honey}`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 24,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <svg width={26} height={24} viewBox="0 0 26 24">
        <path
          d="M13 22 C4 15 1 11 1 7 A6 6 0 0 1 13 5 A6 6 0 0 1 25 7 C25 11 22 15 13 22 Z"
          fill="none"
          stroke={colors.honey}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </svg>
      Une présence calme vaut mille conseils
    </div>
  );
};

export default Cover;
