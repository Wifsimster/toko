import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

// Briques communes des couvertures animées (928 × 1152, boucle de 8 s).
// Modèle de référence : RetoursEnseignant.tsx — l'état ne dépend que de la
// position dans la boucle (0 → 60 pas) et tout revient à son point de départ.

export const COVER_WIDTH = 928;
export const COVER_HEIGHT = 1152;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const soft = Easing.inOut(Easing.cubic);

/** 0 → 1 entre les pas `a` et `b`, sans rebond. */
export const ramp = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], { ...clamp, easing: soft });

/**
 * Position dans la boucle : `s` (0 → 60) et `story`, décalée de `offset` pour
 * que la première image (l'affiche JPG) montre l'état complet.
 */
export const useLoop = (offset: number) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = (frame / durationInFrames) * 60;
  return { s, story: (s + offset) % 60 };
};

/** En-tête : surtitre en capitales, titre serif, sous-titre. */
export const CoverHeader: React.FC<{ kicker: string; title: string; subtitle?: string }> = ({ kicker, title, subtitle }) => (
  <div style={{ position: "absolute", top: 76, left: 64, right: 64 }}>
    <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: colors.teal, textTransform: "uppercase" }}>
      {kicker}
    </div>
    <div style={{ marginTop: 18, fontFamily: fonts.heading, fontWeight: 600, fontSize: 62, lineHeight: 1.08, letterSpacing: -0.5, textWrap: "balance" }}>
      {title}
    </div>
    {subtitle && <div style={{ marginTop: 16, fontSize: 28, lineHeight: 1.35, color: colors.inkSoft }}>{subtitle}</div>}
  </div>
);

// Signe ō — chemin identique à brand/toko-mark.svg.
export const CoverFooter: React.FC<{ sources: string }> = ({ sources }) => (
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
    <div style={{ fontSize: 18, color: colors.inkSoft }}>Équipe Tokō — {sources}</div>
  </div>
);

/** Deux grandes formes douces, fixes, pour donner de la profondeur au fond crème. */
export const CoverBackdrop: React.FC<{ tint?: string; accent?: string }> = ({ tint = colors.tealSoft, accent = colors.honeySoft }) => (
  <svg width={COVER_WIDTH} height={COVER_HEIGHT} style={{ position: "absolute", inset: 0 }}>
    <circle cx={780} cy={610} r={300} fill={tint} opacity={0.7} />
    <circle cx={120} cy={1010} r={220} fill={accent} opacity={0.55} />
  </svg>
);
