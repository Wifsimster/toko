import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { calm, ease } from "../anim";
import { Card } from "../components/Phone";
import { colors, fonts } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Face: React.FC<{ size: number; mood: number; active: boolean }> = ({ size, mood, active }) => {
  // mood : 0 = difficile … 3 = très bien. Courbe de la bouche seulement.
  const curve = [-6, -2, 3, 8][mood];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill={active ? colors.teal : colors.tealSoft} />
      <circle cx="14" cy="16" r="2.2" fill={active ? colors.cream : colors.teal} />
      <circle cx="26" cy="16" r="2.2" fill={active ? colors.cream : colors.teal} />
      <path d={`M12 ${26 - curve / 3} Q20 ${26 + curve} 28 ${26 - curve / 3}`} stroke={active ? colors.cream : colors.teal} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const Chip: React.FC<{ s: number; label: string; on: boolean }> = ({ s, label, on }) => (
  <span
    style={{
      fontSize: 22 * s,
      fontWeight: 600,
      padding: `${10 * s}px ${20 * s}px`,
      borderRadius: 999,
      background: on ? colors.teal : "#fff",
      color: on ? colors.cream : colors.inkSoft,
      border: `${2 * s}px solid ${on ? colors.teal : colors.line}`,
    }}
  >
    {label}
  </span>
);

const Button: React.FC<{ s: number; label: string; pressed: number }> = ({ s, label, pressed }) => (
  <div
    style={{
      marginTop: 26 * s,
      background: colors.teal,
      color: colors.cream,
      borderRadius: 22 * s,
      padding: `${22 * s}px 0`,
      textAlign: "center",
      fontSize: 26 * s,
      fontWeight: 700,
      transform: `scale(${1 - 0.04 * pressed})`,
    }}
  >
    {label}
  </div>
);

export const JournalScreen: React.FC<{ s: number }> = ({ s }) => {
  const frame = useCurrentFrame();
  const selected = frame > 40 ? 2 : -1;
  const typed = "Devoirs faits sans crise. Fier de lui !";
  const chars = Math.floor(interpolate(frame, [55, 95], [0, typed.length], clamp));
  const saved = frame > 108;
  return (
    <div>
      <div style={{ fontSize: 26 * s, fontWeight: 600, marginBottom: 18 * s }}>Comment s'est passée la journée ?</div>
      <Card scale={s} style={{ display: "flex", justifyContent: "space-between" }}>
        {[0, 1, 2, 3].map((m) => (
          <Face key={m} size={70 * s} mood={m} active={m === selected} />
        ))}
      </Card>
      <Card scale={s} style={{ marginTop: 20 * s, minHeight: 150 * s, fontSize: 25 * s, lineHeight: 1.4 }}>
        {typed.slice(0, chars)}
        <span style={{ opacity: chars < typed.length && frame % 20 < 10 ? 1 : 0, color: colors.teal }}>|</span>
      </Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 * s, marginTop: 20 * s }}>
        <Chip s={s} label="École" on={frame > 98} />
        <Chip s={s} label="Victoire" on={frame > 102} />
        <Chip s={s} label="Sommeil" on={false} />
      </div>
      <Button s={s} label={saved ? "Enregistré ✓" : "Enregistrer"} pressed={interpolate(frame, [104, 108, 112], [0, 1, 0], clamp)} />
    </div>
  );
};

const AXES = [
  { label: "Agitation", v: 0.45 },
  { label: "Concentration", v: 0.7 },
  { label: "Impulsivité", v: 0.4 },
  { label: "Émotions", v: 0.62 },
  { label: "Sommeil", v: 0.82 },
  { label: "Social", v: 0.66 },
  { label: "Autonomie", v: 0.55 },
];

export const TrackingScreen: React.FC<{ s: number }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const points = [0.35, 0.42, 0.4, 0.52, 0.5, 0.6, 0.68];
  const draw = ease(frame, 60, 105);
  const W = 290;
  const H = 110;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * W} ${H - p * H}`).join(" ");
  return (
    <div>
      <Card scale={s} style={{ padding: `${18 * s}px ${22 * s}px` }}>
        {AXES.map((a, i) => {
          const p = calm(frame, fps, 10 + i * 5, 26);
          return (
            <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 14 * s, margin: `${9 * s}px 0` }}>
              <div style={{ width: 160 * s, fontSize: 20 * s, fontWeight: 600, color: colors.inkSoft }}>{a.label}</div>
              <div style={{ flex: 1, height: 14 * s, borderRadius: 99, background: colors.tealSoft }}>
                <div style={{ width: `${a.v * p * 100}%`, height: "100%", borderRadius: 99, background: colors.teal }} />
              </div>
            </div>
          );
        })}
      </Card>
      <Card scale={s} style={{ marginTop: 20 * s }}>
        <div style={{ fontSize: 22 * s, fontWeight: 600, marginBottom: 12 * s }}>Sommeil, 7 derniers jours</div>
        <svg width={W * s} height={(H + 10) * s} viewBox={`0 -5 ${W} ${H + 10}`}>
          <path d={path} fill="none" stroke={colors.teal} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </svg>
        <div style={{ fontSize: 20 * s, color: colors.sage, fontWeight: 700, marginTop: 8 * s, opacity: draw }}>En hausse, bonne nouvelle</div>
      </Card>
    </div>
  );
};

export const CrisisScreen: React.FC<{ s: number }> = ({ s }) => {
  const frame = useCurrentFrame();
  // Respiration lente : 4 secondes par cycle.
  const breath = (Math.sin((frame / 30) * (Math.PI / 2) - Math.PI / 2) + 1) / 2;
  const label = breath > 0.5 ? "Souffle doucement" : "Inspire";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
      <div style={{ fontSize: 22 * s, color: colors.inkSoft, fontWeight: 600 }}>Activité 2 sur 5</div>
      <div
        style={{
          marginTop: 30 * s,
          width: 330 * s,
          height: 330 * s,
          borderRadius: 999,
          background: colors.tealSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: (140 + 170 * breath) * s,
            height: (140 + 170 * breath) * s,
            borderRadius: 999,
            background: colors.teal,
            opacity: 0.85,
          }}
        />
      </div>
      <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 38 * s, marginTop: 34 * s, textAlign: "center" }}>
        Respirer comme un ballon
      </div>
      <div style={{ fontSize: 26 * s, color: colors.teal, fontWeight: 700, marginTop: 12 * s }}>{label}</div>
      <div style={{ display: "flex", gap: 10 * s, marginTop: 30 * s }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ width: 14 * s, height: 14 * s, borderRadius: 99, background: i === 1 ? colors.teal : colors.line }} />
        ))}
      </div>
    </div>
  );
};

const Star: React.FC<{ size: number; on: number }> = ({ size, on }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
      fill={on > 0.5 ? colors.honey : "#fff"}
      stroke={on > 0.5 ? colors.honey : colors.line}
      strokeWidth={1.6}
      strokeLinejoin="round"
      style={{ transformOrigin: "12px 12px", transform: `scale(${0.85 + 0.15 * on})` }}
    />
  </svg>
);

export const RewardsScreen: React.FC<{ s: number }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const days = ["L", "M", "M", "J", "V"];
  const rows = ["Dents brossées", "Cartable prêt", "Au lit à l'heure"];
  const filled = [
    [1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1],
    [1, 1, 0, 1, 1],
  ];
  let order = 0;
  const total = 12;
  const count = Math.min(total, Math.floor(interpolate(frame, [15, 85], [0, total + 1], clamp)));
  const unlocked = calm(frame, fps, 92, 24);
  return (
    <div>
      <Card scale={s} style={{ padding: `${18 * s}px ${20 * s}px` }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 * s, fontSize: 18 * s, color: colors.inkSoft, fontWeight: 700 }}>
          {days.map((d, i) => (
            <span key={i} style={{ width: 36 * s, textAlign: "center" }}>{d}</span>
          ))}
        </div>
        {rows.map((r, ri) => (
          <div key={r} style={{ display: "flex", alignItems: "center", marginTop: 14 * s }}>
            <div style={{ flex: 1, fontSize: 19 * s, fontWeight: 600, paddingRight: 8 * s }}>{r}</div>
            {filled[ri].map((f, di) => {
              const idx = f ? order++ : -1;
              const on = f ? calm(frame, fps, 15 + idx * 6, 12) : 0;
              return (
                <span key={di} style={{ width: 36 * s, marginLeft: 6 * s, display: "inline-flex", justifyContent: "center" }}>
                  <Star size={32 * s} on={on} />
                </span>
              );
            })}
          </div>
        ))}
      </Card>
      <div style={{ textAlign: "center", marginTop: 26 * s }}>
        <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 64 * s, color: colors.honey }}>{count} ★</div>
        <div style={{ fontSize: 22 * s, color: colors.inkSoft, fontWeight: 600 }}>étoiles cette semaine</div>
      </div>
      <div
        style={{
          marginTop: 24 * s,
          background: colors.honeySoft,
          borderRadius: 22 * s,
          padding: `${20 * s}px`,
          textAlign: "center",
          fontSize: 24 * s,
          fontWeight: 700,
          color: "#6a521e",
          opacity: unlocked,
          transform: `translateY(${(1 - unlocked) * 16 * s}px)`,
        }}
      >
        Récompense débloquée : sortie au parc
      </div>
    </div>
  );
};
