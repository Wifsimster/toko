import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « alimentation-tdah-enfant ». Une assiette se
// garnit ; en dessous, deux colonnes reprennent la thèse de l'article :
// l'alimentation ne cause pas le TDAH et ne le guérit pas, mais elle compte pour
// l'énergie et l'ambiance à table. Tout se range, l'assiette se vide et le cycle
// reprend. La première image (affiche) montre l'état complet.

const OFFSET = 44;
const RESET = [48, 55];
const FOOD = [2, 5, 8]; // arrivée de chaque élément dans l'assiette
const PLATE = { cx: 464, cy: 566, r: 150 };

const COLUMNS = [
  { title: "Ne fait pas", items: ["Causer le TDAH", "Le guérir"], at: [12, 18], yes: false },
  { title: "Compte pour", items: ["L'énergie", "L'ambiance à table"], at: [24, 30], yes: true },
];

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  const float = Math.sin((2 * Math.PI * s) / 60) * 3;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Alimentation et TDAH" title="Ce que l'assiette peut (et ne peut pas) faire" subtitle="Un repas régulier, sans bataille." />

      <Plate story={story} keep={keep} float={float} />

      {COLUMNS.map((col, c) => (
        <div key={col.title} style={{ position: "absolute", left: c === 0 ? 64 : 484, top: 752, width: 380 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: col.yes ? colors.teal : colors.inkSoft,
              opacity: ramp(story, col.at[0] - 2, col.at[0] + 2) * keep,
            }}
          >
            {col.title}
          </div>
          {col.items.map((item, i) => (
            <Item key={item} text={item} yes={col.yes} enter={ramp(story, col.at[i], col.at[i] + 4)} keep={keep} top={46 + i * 84} />
          ))}
        </div>
      ))}

      <CoverFooter sources="sources NICE, EFSA, Wolraich 1995, McCann 2007, Pelsser 2011" />
    </AbsoluteFill>
  );
};

const Item: React.FC<{ text: string; yes: boolean; enter: number; keep: number; top: number }> = ({ text, yes, enter, keep, top }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top,
      width: 380,
      height: 68,
      transform: `translate(${-24 * (1 - enter)}px, ${12 * (1 - keep)}px)`,
      opacity: enter * keep,
      borderRadius: 20,
      background: yes ? "#fff" : "rgba(255,255,255,0.55)",
      border: `2px solid ${yes ? colors.teal : colors.line}`,
      boxShadow: yes ? "0 12px 26px rgba(53,136,145,0.12)" : "none",
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 20px",
      boxSizing: "border-box",
    }}
  >
    <svg width={36} height={36} viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
      <circle cx={18} cy={18} r={17} fill={yes ? colors.tealSoft : colors.cream} stroke={yes ? colors.teal : colors.inkSoft} strokeOpacity={yes ? 1 : 0.5} strokeWidth={2} />
      {yes ? (
        <path d="M11 19 l5 5 l9 -11" fill="none" stroke={colors.teal} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M12.5 12.5 l11 11 M23.5 12.5 l-11 11" stroke={colors.inkSoft} strokeWidth={3} strokeLinecap="round" />
      )}
    </svg>
    <span style={{ fontSize: 28, fontWeight: 600, color: yes ? colors.ink : colors.inkSoft }}>{text}</span>
  </div>
);

// Assiette vue de dessus, couverts de part et d'autre ; trois formes simples s'y posent.
const Plate: React.FC<{ story: number; keep: number; float: number }> = ({ story, keep, float }) => {
  const { cx, cy, r } = PLATE;
  const food = FOOD.map((t) => ramp(story, t, t + 4) * keep);
  return (
    <svg width={928} height={400} viewBox={`0 ${cy - 200} 928 400`} style={{ position: "absolute", left: 0, top: cy - 200 + float }}>
      {/* Fourchette */}
      <g stroke={colors.inkSoft} strokeOpacity={0.55} strokeWidth={7} strokeLinecap="round" fill="none">
        <line x1={250} x2={250} y1={cy - 70} y2={cy + 120} />
        <path d={`M232 ${cy - 120} v40 a18 18 0 0 0 36 0 v-40`} />
        <line x1={250} x2={250} y1={cy - 120} y2={cy - 85} />
      </g>
      {/* Couteau */}
      <path
        d={`M678 ${cy + 120} V${cy - 120} q24 20 20 90 h-20`}
        fill="none"
        stroke={colors.inkSoft}
        strokeOpacity={0.55}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={colors.line} strokeWidth={3} />
      <circle cx={cx} cy={cy} r={r - 34} fill="none" stroke={colors.line} strokeWidth={2} />
      <g opacity={food[0]} transform={`translate(${cx - 42} ${cy - 30}) scale(${0.9 + 0.1 * food[0]})`}>
        <ellipse cx={0} cy={0} rx={50} ry={38} fill={colors.honeySoft} stroke={colors.honey} strokeWidth={3} />
        <path d="M-30 -6 q15 -14 30 0 q15 14 30 0 M-26 12 q13 -12 26 0 q13 12 26 0" fill="none" stroke={colors.honey} strokeWidth={3} strokeLinecap="round" />
      </g>
      <g opacity={food[1]} transform={`translate(${cx + 52} ${cy - 18}) scale(${0.9 + 0.1 * food[1]}) rotate(-25)`}>
        <path d="M0 -40 q34 20 0 80 q-34 -60 0 -80 z" fill={colors.sageSoft} stroke={colors.sage} strokeWidth={3} />
        <line x1={0} x2={0} y1={-30} y2={32} stroke={colors.sage} strokeWidth={2.5} />
      </g>
      <g opacity={food[2]} transform={`translate(${cx + 6} ${cy + 58}) scale(${0.9 + 0.1 * food[2]})`}>
        <circle cx={-18} cy={0} r={20} fill={colors.tealSoft} stroke={colors.teal} strokeWidth={3} />
        <circle cx={20} cy={4} r={16} fill={colors.tealSoft} stroke={colors.teal} strokeWidth={3} />
      </g>
    </svg>
  );
};

export default Cover;
