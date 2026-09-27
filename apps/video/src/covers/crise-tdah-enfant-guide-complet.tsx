import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « crise-tdah-enfant-guide-complet ».
// La courbe d'une crise se dessine (montée, explosion, redescente), puis le
// plan d'action se pose ligne par ligne : avant, pendant, après. Tout se range
// doucement et le cycle reprend.

const OFFSET = 44;
const RESET = [48, 55];

const PHASES = [
  { label: "La montée", x: 155 },
  { label: "L'explosion", x: 390 },
  { label: "La redescente", x: 643 },
];
const PHASE_START = [4, 9, 14];

const PLAN = [
  { when: "Avant", what: "Identifier les déclencheurs" },
  { when: "Pendant", what: "Co-réguler, ne pas raisonner" },
  { when: "Après", what: "Réparer et apprendre" },
];
const PLAN_START = [21, 27, 33];
const ROW_Y = [728, 832, 936]; // centres des lignes

const CURVE = { left: 56, top: 356, width: 816, height: 304 };
const PATH = "M40 222 C150 222 200 178 270 118 C320 74 460 74 510 118 C580 178 660 222 776 222";

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  const float = Math.sin((2 * Math.PI * s) / 60) * 4;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Guide complet" title="Crise TDAH : avant, pendant, après" subtitle="Neurologique, pas un caprice." />
      <CrisisCurve story={story} keep={keep} float={float} />
      {PLAN.map((p, i) => (
        <PlanRow key={p.when} index={i} story={story} keep={keep} />
      ))}
      <CoverFooter sources="sources Barkley, HyperSupers – TDAH France" />
    </AbsoluteFill>
  );
};

const CrisisCurve: React.FC<{ story: number; keep: number; float: number }> = ({ story, keep, float }) => {
  const draw = ramp(story, 3, 17) * keep;
  return (
    <div
      style={{
        position: "absolute",
        ...CURVE,
        transform: `translateY(${float}px)`,
        background: "#fff",
        borderRadius: 24,
        border: `2px solid ${colors.line}`,
        boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
      }}
    >
      <div style={{ position: "absolute", top: 26, left: 36, fontSize: 22, fontWeight: 600, color: colors.inkSoft, letterSpacing: 1 }}>
        Les 3 phases d'une crise
      </div>
      <svg width={CURVE.width} height={CURVE.height} style={{ position: "absolute", inset: 0 }}>
        <line x1={40} x2={776} y1={222} y2={222} stroke={colors.line} strokeWidth={2} />
        {[270, 510].map((x) => (
          <line key={x} x1={x} x2={x} y1={70} y2={222} stroke={colors.line} strokeWidth={2} strokeDasharray="6 8" />
        ))}
        <path d={`${PATH} L776 222 L40 222 Z`} fill={colors.honeySoft} opacity={0.8 * draw} />
        <path
          d={PATH}
          fill="none"
          stroke={colors.teal}
          strokeWidth={6}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
      {PHASES.map((p, i) => {
        const t = PHASE_START[i];
        const show = ramp(story, t, t + 3) * keep;
        return (
          <div
            key={p.label}
            style={{
              position: "absolute",
              left: p.x - 120,
              width: 240,
              top: 240,
              textAlign: "center",
              fontSize: 24,
              fontWeight: 600,
              opacity: show,
              transform: `translateY(${8 * (1 - show)}px)`,
            }}
          >
            {p.label}
          </div>
        );
      })}
    </div>
  );
};

const PlanRow: React.FC<{ index: number; story: number; keep: number }> = ({ index, story, keep }) => {
  const t = PLAN_START[index];
  const enter = ramp(story, t, t + 4);
  const { when, what } = PLAN[index];
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        width: 816,
        height: 84,
        top: ROW_Y[index] - 42,
        transform: `translate(${-40 * (1 - enter)}px, ${14 * (1 - keep)}px)`,
        opacity: enter * keep,
        background: "#fff",
        borderRadius: 22,
        border: `2px solid ${colors.teal}`,
        boxShadow: "0 14px 30px rgba(53,136,145,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 150,
          height: 52,
          borderRadius: 14,
          background: colors.tealSoft,
          color: colors.teal,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {when}
      </div>
      <span style={{ fontSize: 28, fontWeight: 600, whiteSpace: "nowrap" }}>{what}</span>
    </div>
  );
};

export default Cover;
