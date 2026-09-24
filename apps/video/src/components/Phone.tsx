import { colors, fonts } from "../theme";

// Téléphone stylisé : l'app Tokō est une PWA pensée d'abord pour le smartphone.
export const Phone: React.FC<{ scale: number; children: React.ReactNode; title: string }> = ({
  scale,
  children,
  title,
}) => {
  const w = 440 * scale;
  const h = 820 * scale;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 64 * scale,
        background: colors.night,
        padding: 14 * scale,
        boxShadow: `0 ${40 * scale}px ${90 * scale}px rgba(9,17,35,0.18)`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 52 * scale,
          background: colors.cream,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: fonts.sans,
          color: colors.ink,
        }}
      >
        <div
          style={{
            height: 110 * scale,
            display: "flex",
            alignItems: "flex-end",
            padding: `0 ${34 * scale}px ${16 * scale}px`,
            fontFamily: fonts.heading,
            fontWeight: 600,
            fontSize: 34 * scale,
          }}
        >
          {title}
        </div>
        <div style={{ flex: 1, padding: `${10 * scale}px ${28 * scale}px`, position: "relative" }}>{children}</div>
      </div>
    </div>
  );
};

export const Card: React.FC<{ scale: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  scale,
  children,
  style,
}) => (
  <div
    style={{
      background: "#fff",
      border: `${2 * scale}px solid ${colors.line}`,
      borderRadius: 26 * scale,
      padding: 24 * scale,
      ...style,
    }}
  >
    {children}
  </div>
);
