import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « dysregulation-emotionnelle-tdah ».
// Un cadran de volume monte jusqu'à 11 (« comme si le volume était bloqué sur
// 11 »), puis une phrase qui nomme l'émotion sans la juger apparaît. Tout se
// range doucement et le cycle reprend.

const OFFSET = 44;
const RESET = [48, 55];

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 34px ${fonts.heading}`, "Tu es très en colère").then(() => continueRender(italicHandle));

const CARD = { left: 56, top: 356, width: 816, height: 404 };
const DIAL = { cx: 408, cy: 300, r: 230 };
const MAX = 11;

// Position d'une valeur sur le cadran : 0 à gauche, 11 à droite.
const at = (v: number, r: number) => {
  const a = Math.PI * (1 - v / MAX);
  return { x: DIAL.cx + r * Math.cos(a), y: DIAL.cy - r * Math.sin(a) };
};

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  const float = Math.sin((2 * Math.PI * s) / 60) * 4;
  const value = MAX * ramp(story, 3, 16) * keep;
  const caption = ramp(story, 14, 18) * keep;
  const bubble = ramp(story, 22, 27);

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader
        kicker="Dysrégulation émotionnelle"
        title="Trop fort, trop vite, trop longtemps"
        subtitle="Ni un caprice, ni un manque d'éducation."
      />

      <div
        style={{
          position: "absolute",
          ...CARD,
          transform: `translateY(${float}px)`,
          background: "#fff",
          borderRadius: 24,
          border: `2px solid ${colors.line}`,
          boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
        }}
      >
        <Dial value={value} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 336,
            textAlign: "center",
            fontSize: 28,
            fontWeight: 600,
            opacity: caption,
            transform: `translateY(${8 * (1 - caption)}px)`,
          }}
        >
          Le volume bloqué sur 11
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 56,
          width: 816,
          top: 800,
          height: 150,
          transform: `translateY(${16 * (1 - bubble) + 14 * (1 - keep)}px)`,
          opacity: bubble * keep,
          background: "#fff",
          borderRadius: 24,
          border: `2px solid ${colors.teal}`,
          boxShadow: "0 14px 30px rgba(53,136,145,0.14)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 10,
          padding: "0 36px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: colors.teal, textTransform: "uppercase" }}>
          Nommer l'émotion sans la juger
        </div>
        <div style={{ fontFamily: fonts.heading, fontStyle: "italic", fontWeight: 500, fontSize: 34, whiteSpace: "nowrap" }}>
          « Tu es très en colère là. C'est ok. »
        </div>
      </div>

      <CoverFooter sources="sources Barkley, HAS, INSERM" />
    </AbsoluteFill>
  );
};

const Dial: React.FC<{ value: number }> = ({ value }) => {
  const { cx, cy, r } = DIAL;
  const start = at(0, r);
  const end = at(value, r);
  const tip = at(value, 160);
  return (
    <svg width={CARD.width} height={CARD.height} style={{ position: "absolute", inset: 0 }}>
      {/* Piste du cadran, puis la part « allumée » en miel */}
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={colors.line} strokeWidth={22} strokeLinecap="round" />
      {value > 0.01 && (
        <path d={`M${start.x} ${start.y} A${r} ${r} 0 0 1 ${end.x} ${end.y}`} fill="none" stroke={colors.honey} strokeWidth={22} strokeLinecap="round" />
      )}
      {Array.from({ length: MAX + 1 }, (_, v) => {
        const p = at(v, 186);
        return (
          <text
            key={v}
            x={p.x}
            y={p.y + 8}
            textAnchor="middle"
            fontFamily={fonts.sans}
            fontSize={v === MAX ? 30 : 22}
            fontWeight={v === MAX ? 700 : 600}
            fill={v === MAX ? colors.ink : colors.inkSoft}
          >
            {v}
          </text>
        );
      })}
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={colors.ink} strokeWidth={7} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={18} fill={colors.teal} />
    </svg>
  );
};

export default Cover;
