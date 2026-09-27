import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « hypersensibilite-sensorielle-tdah ».
// Cinq stimuli arrivent tous au premier plan, tous forts (barres miel qui
// frémissent). Trois aménagements se posent l'un après l'autre et font
// redescendre chacun sa barre, qui passe au bleu-vert. Tout se range
// doucement et le cycle reprend.

const OFFSET = 44;
const RESET = [48, 55];

const CARD = { left: 56, top: 300, width: 816, height: 420 };
const STIMULI = ["Bruits", "Lumières", "Textures", "Odeurs", "Foule"];
const WOBBLE = [3, 2, 3, 2, 3]; // cycles par boucle, entiers pour boucler
const BAR = { baseline: 326, max: 220, width: 64, col: 736 / 5 };

const FIXES = [
  { label: "Casque anti-bruit", target: "bruits" },
  { label: "Lumières chaudes", target: "lumières" },
  { label: "Vêtements sans étiquette", target: "textures" },
];
const FIX_START = [14, 21, 28];
const ROW_Y = [778, 856, 934]; // centres des lignes

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  const rise = ramp(story, 2, 9);

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Hypersensibilité sensorielle" title="Quand tout est trop fort" subtitle="Ni de la comédie, ni un caprice." />

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
        <div style={{ position: "absolute", top: 28, left: 36, fontSize: 22, fontWeight: 600, color: colors.inkSoft, letterSpacing: 0.5 }}>
          Tout arrive en même temps, fort.
        </div>
        <svg width={CARD.width} height={CARD.height} style={{ position: "absolute", inset: 0 }}>
          <line x1={36} x2={780} y1={BAR.baseline} y2={BAR.baseline} stroke={colors.line} strokeWidth={2} />
          {STIMULI.map((label, i) => {
            const filtered = i < FIXES.length ? ramp(story, FIX_START[i] + 2, FIX_START[i] + 8) * keep : 0;
            const loud = 0.84 + 0.1 * Math.sin((2 * Math.PI * WOBBLE[i] * s) / 60 + i * 1.3);
            const h = BAR.max * (0.18 + (loud - 0.18) * rise * keep) * (1 - 0.62 * filtered);
            const x = 40 + BAR.col * i + (BAR.col - BAR.width) / 2;
            return (
              <g key={label}>
                <rect x={x} y={BAR.baseline - h} width={BAR.width} height={h} rx={14} fill={colors.honey} opacity={1 - filtered} />
                <rect x={x} y={BAR.baseline - h} width={BAR.width} height={h} rx={14} fill={colors.teal} opacity={filtered} />
                <text x={x + BAR.width / 2} y={BAR.baseline + 44} textAnchor="middle" fontFamily={fonts.sans} fontSize={24} fontWeight={600} fill={colors.ink}>
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {FIXES.map((f, i) => {
        const enter = ramp(story, FIX_START[i], FIX_START[i] + 4);
        return (
          <div
            key={f.label}
            style={{
              position: "absolute",
              left: 56,
              width: 816,
              top: ROW_Y[i] - 32,
              height: 64,
              transform: `translate(${-40 * (1 - enter)}px, ${14 * (1 - keep)}px)`,
              opacity: enter * keep,
              background: colors.tealSoft,
              border: `2px solid ${colors.teal}`,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 30px",
              boxSizing: "border-box",
            }}
          >
            <span style={{ fontSize: 27, fontWeight: 600 }}>{f.label}</span>
            <span style={{ fontSize: 22, fontWeight: 600, color: colors.teal }}>↓ {f.target}</span>
          </div>
        );
      })}

      <CoverFooter sources="sources Barkley, HAS, INSERM" />
    </AbsoluteFill>
  );
};

export default Cover;
