import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « medication-tdah-mythes-parents ». Trois
// phrases entendues partout reçoivent, l'une après l'autre, une étiquette
// « Vrai ou faux ? ». En face, la fiche « Votre rôle » se remplit : observer,
// noter les effets, en parler en consultation ; puis le rappel que la décision
// se prend avec le pédopsychiatre. Aucun nom de médicament, aucune dose, aucun
// conseil de traitement. Tout se range et le cycle reprend.
//
// Boucle parfaite : l'état ne dépend que de `story` (0 → 60), décalé (OFFSET)
// pour que la première image, l'affiche JPG, montre l'état complet.

const OFFSET = 44;

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 40px ${fonts.heading}`, "Les médicaments").then(() => continueRender(italicHandle));

const HEARD = [
  "« Les médicaments vont le zombifier »",
  "« Les effets secondaires sont terribles »",
  "« Les médicaments rendent dépendant »",
];
const HEARD_TOP = [364, 540, 716];
const TAG = [4, 10, 16]; // étiquette « Vrai ou faux ? », en pas (60 par boucle)

const ROLE = ["Observer au quotidien", "Noter les effets, positifs et négatifs", "En parler en consultation"];
const ROLE_START = [20, 25, 30];
const DECIDE = 36; // rappel final
const RESET = [48, 55]; // tout se range

const LEFT = { left: 64, width: 392 };
const SHEET = { left: 488, top: 364, width: 384, height: 470 };

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  const float = Math.sin((2 * Math.PI * s) / 60) * 4;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Médication TDAH" title="Démêler le vrai du faux" subtitle="Les mythes que tout parent entend." />

      {HEARD.map((text, i) => (
        <Heard key={text} index={i} text={text} story={story} keep={keep} float={i % 2 === 0 ? float : -float} />
      ))}

      <RoleSheet story={story} keep={keep} float={float} />
      <Decide story={story} keep={keep} />

      <CoverFooter sources="sources HAS, INSERM, AAP" />
    </AbsoluteFill>
  );
};

const Heard: React.FC<{ index: number; text: string; story: number; keep: number; float: number }> = ({
  index,
  text,
  story,
  keep,
  float,
}) => {
  const tag = ramp(story, TAG[index], TAG[index] + 4) * keep;
  return (
    <div
      style={{
        position: "absolute",
        left: LEFT.left,
        width: LEFT.width,
        top: HEARD_TOP[index],
        transform: `translateY(${float}px) rotate(${index === 1 ? 1 : -1}deg)`,
        padding: "22px 26px 20px",
        boxSizing: "border-box",
        background: "#fff",
        border: `2px solid ${colors.line}`,
        borderRadius: 22,
        boxShadow: "0 12px 28px rgba(31,41,55,0.06)",
        fontFamily: fonts.heading,
        fontStyle: "italic",
        fontWeight: 500,
        fontSize: 30,
        lineHeight: 1.2,
        color: colors.inkSoft,
      }}
    >
      {text}
      {/* Étiquette épinglée en haut à droite */}
      <div
        style={{
          position: "absolute",
          right: -10,
          top: -22,
          transform: `translateY(${-8 * (1 - tag)}px) rotate(${3 - 3 * tag + 2}deg)`,
          opacity: tag,
          padding: "6px 14px",
          borderRadius: 10,
          background: colors.honeySoft,
          border: `2px solid ${colors.honey}`,
          fontFamily: fonts.sans,
          fontStyle: "normal",
          fontSize: 22,
          fontWeight: 700,
          color: colors.ink,
          whiteSpace: "nowrap",
        }}
      >
        Vrai ou faux ?
      </div>
    </div>
  );
};

const RoleSheet: React.FC<{ story: number; keep: number; float: number }> = ({ story, keep, float }) => (
  <div
    style={{
      position: "absolute",
      ...SHEET,
      transform: `translateY(${-float}px) rotate(1.2deg)`,
      background: "#fff",
      borderRadius: 22,
      border: `2px solid ${colors.line}`,
      boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
      overflow: "hidden",
    }}
  >
    <svg width={SHEET.width} height={SHEET.height} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 10 }, (_, k) => (
        <line key={k} x1={0} x2={SHEET.width} y1={96 + k * 42} y2={96 + k * 42} stroke={colors.tealSoft} strokeWidth={2} />
      ))}
    </svg>
    <div style={{ position: "absolute", top: 32, left: 28, fontSize: 22, fontWeight: 700, letterSpacing: 2, color: colors.teal, textTransform: "uppercase" }}>
      Votre rôle
    </div>
    {ROLE.map((text, i) => {
      const t = ROLE_START[i];
      const enter = ramp(story, t, t + 4) * keep;
      const check = ramp(story, t + 2, t + 5) * keep;
      return (
        <div
          key={text}
          style={{
            position: "absolute",
            left: 24,
            right: 20,
            top: 104 + i * 116,
            height: 96,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: enter,
            transform: `translateX(${-24 * (1 - enter)}px)`,
          }}
        >
          <Check progress={check} />
          <span style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.2 }}>{text}</span>
        </div>
      );
    })}
  </div>
);

const Check: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={48} height={48} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
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

const Decide: React.FC<{ story: number; keep: number }> = ({ story, keep }) => {
  const enter = ramp(story, DECIDE, DECIDE + 4);
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 56,
        top: 890,
        height: 66,
        transform: `translateY(${16 * (1 - enter) + 14 * (1 - keep)}px)`,
        opacity: enter * keep,
        borderRadius: 999,
        background: colors.teal,
        color: colors.cream,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        fontSize: 24,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <svg width={30} height={26} viewBox="0 0 30 26">
        <path d="M3 4 h16 a3 3 0 0 1 3 3 v7 a3 3 0 0 1 -3 3 h-9 l-5 5 v-5 h-2 a3 3 0 0 1 -3 -3 v-7 a3 3 0 0 1 3 -3 Z" fill="none" stroke={colors.cream} strokeWidth={2.2} strokeLinejoin="round" />
        <path d="M24 9 h2 a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -3 3 h-1 v4 l-4 -4 h-5" fill="none" stroke={colors.cream} strokeWidth={2.2} strokeLinejoin="round" />
      </svg>
      La décision se prend avec le pédopsychiatre
    </div>
  );
};

export default Cover;
