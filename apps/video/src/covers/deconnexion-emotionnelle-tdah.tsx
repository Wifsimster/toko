import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader, ramp, useLoop } from "./shared";

// Couverture animée de l'article « deconnexion-emotionnelle-tdah ».
// Les trois réponses au stress se posent (combat, fuite, figement) et le
// figement s'éclaire. Puis ce qui aide : un repère dit à voix basse, et un
// anneau qui se remplit lentement, parce qu'il suffit souvent d'attendre.
// Tout se range doucement et le cycle reprend.

const OFFSET = 44;
const RESET = [48, 55];

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 30px ${fonts.heading}`, "Je reste à côté").then(() => continueRender(italicHandle));

const RESPONSES = ["Combat", "Fuite", "Figement"];
const RESPONSE_START = [2, 5, 8];
const TILE = { top: 400, width: 250, height: 96, gap: 33 };

const HELP = { left: 56, top: 540, width: 816, height: 420 };
const RING = { cx: 130, cy: 318, r: 68 };

const Cover: React.FC = () => {
  const { s, story } = useLoop(OFFSET);
  const keep = 1 - ramp(story, RESET[0], RESET[1]);
  const float = Math.sin((2 * Math.PI * s) / 60) * 4;
  const focus = ramp(story, 11, 15) * keep;
  const card = ramp(story, 17, 21);
  const quote = ramp(story, 20, 25) * keep;
  const wait = ramp(story, 25, 42) * keep;
  const waitText = ramp(story, 26, 30) * keep;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <CoverBackdrop />
      <CoverHeader kicker="Déconnexion émotionnelle" title="Quand votre enfant se ferme" subtitle="Ce n'est pas une bouderie." />

      <div style={{ position: "absolute", left: 64, top: 356, fontSize: 22, fontWeight: 600, color: colors.inkSoft, letterSpacing: 1 }}>
        Trois réponses au stress
      </div>
      {RESPONSES.map((label, i) => {
        const enter = ramp(story, RESPONSE_START[i], RESPONSE_START[i] + 3) * keep;
        const isFreeze = i === 2;
        const dim = isFreeze ? 1 : 1 - 0.5 * focus;
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: 56 + i * (TILE.width + TILE.gap),
              top: TILE.top,
              width: TILE.width,
              height: TILE.height,
              transform: `translateY(${12 * (1 - enter)}px)`,
              opacity: enter * dim,
              background: isFreeze ? `color-mix(in srgb, ${colors.tealSoft} ${focus * 100}%, #fff)` : "#fff",
              borderRadius: 22,
              border: `2px solid ${isFreeze ? colors.teal : colors.line}`,
              boxShadow: "0 14px 30px rgba(31,41,55,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
              color: isFreeze ? colors.teal : colors.ink,
            }}
          >
            {label}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          ...HELP,
          transform: `translateY(${float + 16 * (1 - card) + 14 * (1 - keep)}px)`,
          opacity: card * keep,
          background: "#fff",
          borderRadius: 24,
          border: `2px solid ${colors.line}`,
          boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
        }}
      >
        <div style={{ position: "absolute", top: 30, left: 40, fontSize: 22, fontWeight: 700, letterSpacing: 2, color: colors.teal, textTransform: "uppercase" }}>
          Ce qui aide
        </div>
        <div
          style={{
            position: "absolute",
            top: 78,
            left: 40,
            right: 40,
            padding: "22px 30px",
            borderRadius: "24px 24px 24px 6px",
            background: colors.tealSoft,
            fontFamily: fonts.heading,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.3,
            opacity: quote,
            transform: `translateY(${10 * (1 - quote)}px)`,
          }}
        >
          « Je reste à côté, tu me dis quand tu es prêt. »
        </div>

        <svg width={HELP.width} height={HELP.height} style={{ position: "absolute", inset: 0 }}>
          <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" stroke={colors.line} strokeWidth={12} />
          <circle
            cx={RING.cx}
            cy={RING.cy}
            r={RING.r}
            fill="none"
            stroke={colors.teal}
            strokeWidth={12}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - wait}
            transform={`rotate(-90 ${RING.cx} ${RING.cy})`}
            opacity={wait > 0.005 ? 1 : 0}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            left: RING.cx - 60,
            width: 120,
            top: RING.cy - 30,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.2,
            color: colors.teal,
            opacity: waitText,
          }}
        >
          5 à 20
          <br />
          min
        </div>
        <div style={{ position: "absolute", left: 250, right: 40, top: RING.cy - 56, opacity: waitText }}>
          <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 42 }}>Attendre.</div>
          <div style={{ marginTop: 6, fontSize: 26, lineHeight: 1.3, color: colors.inkSoft }}>Le figement se dissipe seul, sans pression.</div>
        </div>
      </div>

      <CoverFooter sources="sources Barkley, HAS, INSERM" />
    </AbsoluteFill>
  );
};

export default Cover;
