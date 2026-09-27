import { AbsoluteFill, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « tdah-ecrans-ne-causent-pas ». Une tablette
// affiche un minuteur visible qui se vide ; à côté, les règles de l'article
// arrivent une à une. Quand le temps est écoulé, l'écran s'éteint et une étoile
// apparaît tout de suite. Puis l'écran se rallume, le minuteur se remplit, et le
// cycle reprend. La première image (affiche) montre l'état complet.

const OFFSET = 44;
const RESET = [48, 55];
const TIMER = [4, 30]; // le minuteur se vide
const RULE_START = [2, 12, 30]; // arrivée de chaque règle

const RULES = [
  { text: "Timer visible", icon: "timer" },
  { text: "Prévenir 5 min, puis 2 min avant", icon: "bell" },
  { text: "Récompense immédiate", icon: "star" },
] as const;

type IconKind = (typeof RULES)[number]["icon"];

const TAB = { left: 64, top: 392, width: 360, height: 540 };
const SCREEN = { width: TAB.width - 44, height: TAB.height - 44 };
const RULE_Y = [500, 662, 824];
const CARD = { left: 464, width: 400, height: 124 };
const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5-4.9-4.6 6.6-.8z";

const Cover: React.FC = () => {
  const { story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  // Temps restant : se vide pendant l'histoire, se remplit pendant le rangement.
  const remaining =
    story >= RESET[0]
      ? ramp(story, RESET[0], RESET[1])
      : 1 - interpolate(story, TIMER, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const off = ramp(story, TIMER[1], TIMER[1] + 4) * keep;
  const star = ramp(story, TIMER[1] + 3, TIMER[1] + 7) * keep;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Écrans et TDAH" title="Les écrans n'ont pas causé son TDAH" subtitle="Cadrer plutôt que supprimer." />
      <Tablet remaining={remaining} off={off} star={star} />
      {RULES.map((r, i) => (
        <Rule key={r.text} index={i} text={r.text} icon={r.icon} story={story} keep={keep} />
      ))}
      <CoverFooter sources="sources Faraone et al. 2021, approche Barkley" />
    </AbsoluteFill>
  );
};

const Tablet: React.FC<{ remaining: number; off: number; star: number }> = ({ remaining, off, star }) => {
  const r = 112;
  const c = 2 * Math.PI * r;
  const cx = SCREEN.width / 2;
  const cy = 220;
  return (
    <div
      style={{
        position: "absolute",
        ...TAB,
        transform: "rotate(-1.5deg)",
        background: colors.night,
        borderRadius: 40,
        padding: 22,
        boxSizing: "border-box",
        boxShadow: "0 18px 40px rgba(31,41,55,0.14)",
      }}
    >
      <div style={{ position: "relative", ...SCREEN, borderRadius: 22, overflow: "hidden", background: colors.tealSoft }}>
        {/* Minuteur visible : l'anneau teal est le temps qui reste */}
        <svg width={SCREEN.width} height={SCREEN.height} style={{ position: "absolute", inset: 0 }}>
          <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={colors.line} strokeWidth={14} />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={colors.teal}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - remaining)}
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity={remaining > 0.004 ? 1 : 0}
          />
          <line x1={cx} x2={cx} y1={cy - r + 30} y2={cy - r + 48} stroke={colors.inkSoft} strokeWidth={5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={8} fill={colors.teal} />
        </svg>
        {/* Écran éteint : un voile nuit, puis l'étoile */}
        <div style={{ position: "absolute", inset: 0, background: colors.night, opacity: off * 0.94 }} />
        <svg
          width={150}
          height={150}
          viewBox="0 0 24 24"
          style={{ position: "absolute", left: cx - 75, top: cy - 75, opacity: star, transform: `scale(${0.9 + 0.1 * star})` }}
        >
          <path d={STAR} fill={colors.honey} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 380,
            textAlign: "center",
            fontSize: 26,
            fontWeight: 600,
            color: colors.honeySoft,
            opacity: star,
          }}
        >
          Écran éteint
        </div>
      </div>
    </div>
  );
};

const Rule: React.FC<{ index: number; text: string; icon: IconKind; story: number; keep: number }> = ({ index, text, icon, story, keep }) => {
  const enter = ramp(story, RULE_START[index], RULE_START[index] + 5);
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left,
        top: RULE_Y[index] - CARD.height / 2,
        width: CARD.width,
        height: CARD.height,
        transform: `translate(${-40 * (1 - enter)}px, ${14 * (1 - keep)}px)`,
        opacity: enter * keep,
        background: "#fff",
        borderRadius: 24,
        border: `2px solid ${icon === "star" ? colors.honey : colors.teal}`,
        boxShadow: "0 14px 30px rgba(53,136,145,0.14)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
      <Icon kind={icon} />
      <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2, textWrap: "balance" }}>{text}</span>
    </div>
  );
};

const Icon: React.FC<{ kind: IconKind }> = ({ kind }) => {
  const tone = kind === "star" ? colors.honey : colors.teal;
  return (
    <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
      <rect x={1} y={1} width={50} height={50} rx={14} fill={kind === "star" ? colors.honeySoft : colors.tealSoft} stroke={tone} strokeWidth={2} />
      {kind === "timer" && (
        <>
          <circle cx={26} cy={29} r={12} fill="none" stroke={tone} strokeWidth={3.5} />
          <line x1={26} x2={26} y1={29} y2={22} stroke={tone} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={21} x2={31} y1={12} y2={12} stroke={tone} strokeWidth={3.5} strokeLinecap="round" />
        </>
      )}
      {kind === "bell" && (
        <>
          <path d="M17 33 q0-16 9-16 q9 0 9 16 z" fill="none" stroke={tone} strokeWidth={3.5} strokeLinejoin="round" />
          <line x1={14} x2={38} y1={33} y2={33} stroke={tone} strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={26} cy={39} r={3} fill={tone} />
        </>
      )}
      {kind === "star" && (
        <g transform="translate(10 10) scale(1.33)">
          <path d={STAR} fill={tone} />
        </g>
      )}
    </svg>
  );
};

export default Cover;
