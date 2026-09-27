import "@fontsource-variable/source-serif-4/wght-italic.css";
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

// Couverture animée de l'article « retours-enseignant-tdah-enfant » (928 × 1152,
// comme les couvertures JPG). Trois remarques du cahier de liaison deviennent,
// l'une après l'autre, trois pistes à tester, puis un point de suivi ; tout se
// range doucement et le cycle reprend.
//
// Boucle parfaite : l'état ne dépend que de la position dans la boucle
// (`step`, 0 → 60) et chaque animation revient à son point de départ. L'histoire
// est décalée (OFFSET) pour que la première image montre l'état complet : c'est
// aussi l'affiche (poster JPG), donc aucun saut quand la vidéo démarre.

export const COVER_FPS = 30;
export const COVER_SECONDS = 8;
const OFFSET = 44;

const italicHandle = delayRender("Police italique");
document.fonts.load(`italic 500 40px ${fonts.heading}`, "Se disperse").then(() => continueRender(italicHandle));

const PAIRS = [
  { remark: "« Se disperse »", idea: "Une place au calme" },
  { remark: "« Ne finit pas »", idea: "Une consigne à la fois" },
  { remark: "« Se lève sans arrêt »", idea: "Une pause pour bouger" },
];

const ROW_Y = [498, 658, 818]; // centres des lignes, en px de la couverture
const START = [4, 12, 20]; // début de chaque transformation, en pas (60 par boucle)
const FOLLOW_UP = 29; // arrivée du point de suivi
const RESET = [48, 55]; // tout se range

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const soft = Easing.inOut(Easing.cubic);
const ramp = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], { ...clamp, easing: soft });

const useStep = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = (frame / durationInFrames) * 60;
  return { s, story: (s + OFFSET) % 60 };
};

export const RetoursEnseignantCover: React.FC = () => {
  const { s, story } = useStep();
  const reset = ramp(story, RESET[0], RESET[1]);
  const keep = 1 - reset;
  // Léger flottement du cahier, un tour entier par boucle.
  const float = Math.sin((2 * Math.PI * s) / 60) * 4;

  return (
    <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
      <Backdrop />

      <div style={{ position: "absolute", top: 76, left: 64, right: 64 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: colors.teal, textTransform: "uppercase" }}>
          Cahier de liaison
        </div>
        <div style={{ marginTop: 18, fontFamily: fonts.heading, fontWeight: 600, fontSize: 62, lineHeight: 1.08, letterSpacing: -0.5 }}>
          Premiers retours de l'enseignant
        </div>
        <div style={{ marginTop: 16, fontSize: 28, lineHeight: 1.35, color: colors.inkSoft }}>
          Une remarque, une piste à tester.
        </div>
      </div>

      <Notebook float={float} story={story} keep={keep} />

      {PAIRS.map((p, i) => (
        <IdeaCard key={p.idea} index={i} text={p.idea} story={story} keep={keep} />
      ))}

      <FollowUp story={story} keep={keep} />

      <Footer />
    </AbsoluteFill>
  );
};

// Deux grandes formes douces, fixes, pour donner de la profondeur au fond crème.
const Backdrop: React.FC = () => (
  <svg width={928} height={1152} style={{ position: "absolute", inset: 0 }}>
    <circle cx={780} cy={610} r={300} fill={colors.tealSoft} opacity={0.7} />
    <circle cx={120} cy={1010} r={220} fill={colors.honeySoft} opacity={0.55} />
  </svg>
);

const NOTE = { left: 56, top: 356, width: 420, height: 580 };

const Notebook: React.FC<{ float: number; story: number; keep: number }> = ({ float, story, keep }) => (
  <div
    style={{
      position: "absolute",
      ...NOTE,
      transform: `translateY(${float}px) rotate(-1.5deg)`,
      background: "#fff",
      borderRadius: 22,
      border: `2px solid ${colors.line}`,
      boxShadow: "0 18px 40px rgba(31,41,55,0.08)",
      overflow: "hidden",
    }}
  >
    {/* Lignes du cahier et marge */}
    <svg width={NOTE.width} height={NOTE.height} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 13 }, (_, k) => (
        <line key={k} x1={0} x2={NOTE.width} y1={120 + k * 40} y2={120 + k * 40} stroke="#dbe7ee" strokeWidth={1.5} />
      ))}
      <line x1={56} x2={56} y1={0} y2={NOTE.height} stroke={colors.honey} strokeOpacity={0.45} strokeWidth={2} />
    </svg>
    <div style={{ position: "absolute", top: 40, left: 80, fontSize: 20, fontWeight: 600, color: colors.inkSoft, letterSpacing: 1 }}>
      Mot de l'enseignant
    </div>
    {PAIRS.map((p, i) => {
      const t = START[i];
      const swipe = ramp(story, t, t + 3) * keep;
      const dim = 1 - 0.45 * ramp(story, t + 3, t + 6) * keep;
      return (
        <div
          key={p.remark}
          style={{
            position: "absolute",
            left: 80,
            top: ROW_Y[i] - NOTE.top - 26,
            height: 52,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Surligneur miel, sous le texte */}
          <div
            style={{
              position: "absolute",
              left: -8,
              top: 10,
              height: 34,
              width: `calc(${swipe * 100}% + ${16 * swipe}px)`,
              background: colors.honeySoft,
              borderRadius: 8,
            }}
          />
          <span
            style={{
              position: "relative",
              fontFamily: fonts.heading,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 34,
              whiteSpace: "nowrap",
              color: colors.ink,
              opacity: dim,
            }}
          >
            {p.remark}
          </span>
        </div>
      );
    })}
  </div>
);

const CARD = { left: 500, width: 372, height: 112 };

const IdeaCard: React.FC<{ index: number; text: string; story: number; keep: number }> = ({ index, text, story, keep }) => {
  const t = START[index];
  const enter = ramp(story, t + 2, t + 6);
  const check = ramp(story, t + 5, t + 8);
  // Sort doucement du cahier vers sa place ; se range en glissant un peu vers le bas.
  const x = -70 * (1 - enter);
  const y = 14 * (1 - keep);
  const opacity = enter * keep;
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left,
        top: ROW_Y[index] - CARD.height / 2,
        width: CARD.width,
        height: CARD.height,
        transform: `translate(${x}px, ${y}px) scale(${0.94 + 0.06 * enter})`,
        opacity,
        background: "#fff",
        borderRadius: 24,
        border: `2px solid ${colors.teal}`,
        boxShadow: "0 14px 30px rgba(53,136,145,0.14)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
      <Check progress={check} />
      <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2, textWrap: "balance" }}>{text}</span>
    </div>
  );
};

const Check: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
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

const FollowUp: React.FC<{ story: number; keep: number }> = ({ story, keep }) => {
  const enter = ramp(story, FOLLOW_UP, FOLLOW_UP + 4);
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left,
        top: 902,
        width: CARD.width,
        height: 64,
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
      <svg width={28} height={28} viewBox="0 0 28 28">
        <rect x={3} y={5} width={22} height={20} rx={5} fill="none" stroke={colors.cream} strokeWidth={2.5} />
        <line x1={3} x2={25} y1={11} y2={11} stroke={colors.cream} strokeWidth={2.5} />
        <line x1={9} x2={9} y1={2} y2={7} stroke={colors.cream} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={19} x2={19} y1={2} y2={7} stroke={colors.cream} strokeWidth={2.5} strokeLinecap="round" />
      </svg>
      Point de suivi : 3 semaines
    </div>
  );
};

// Signe ō — chemin identique à brand/toko-mark.svg.
const Footer: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 58, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={30} height={37} viewBox="0 0 80 98.5">
        <path
          transform="translate(-10 -0.75)"
          d="M28.75 10.75h42.5a4.75 4.75 0 0 1 0 9.5h-42.5a4.75 4.75 0 0 1 0-9.5ZM20 59.25a30 30 0 1 0 60 0a30 30 0 1 0-60 0ZM31.5 59.25a18.5 22 0 1 1 37 0a18.5 22 0 1 1-37 0Z"
          fill={colors.teal}
        />
      </svg>
      <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 34, letterSpacing: -0.3 }}>Tokō</span>
    </div>
    <div style={{ fontSize: 18, color: colors.inkSoft }}>Équipe Tokō — sources HAS, HyperSupers – TDAH France</div>
  </div>
);
