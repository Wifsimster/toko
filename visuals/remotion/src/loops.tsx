import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, LoopProps, ramp, smooth, TAU, THEMES, useSteps} from './common';

// ─── Accueil : un gribouillis qui se démêle en une ligne claire ───────────
// « Quelques questions pour y voir plus clair ». Aller-retour : démêlé de 10
// à 24, tenu jusqu'à 46, puis se ré-emmêle doucement pour boucler.
export const Clarity: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const k = smooth(ramp(s, 8, 24)) * (1 - smooth(ramp(s, 46, 58)));
  const N = 140;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    // Pelote : spirale bruitée autour de (62, 60), qui tourne lentement.
    const a = t * TAU * 6.5 + s * 0.05 * (1 - k);
    const r = 10 + 26 * Math.abs(Math.sin(t * 9.3)) * (0.55 + 0.45 * Math.sin(t * 23));
    const tx = 62 + r * Math.cos(a);
    const ty = 60 + r * 0.8 * Math.sin(a * 1.13);
    // Ligne claire : une onde douce de gauche à droite.
    const lx = 26 + t * 174;
    const ly = 60 + 7 * Math.sin(t * TAU * 1.5) * (1 - t * 0.6);
    pts.push(`${(tx + (lx - tx) * k).toFixed(2)},${(ty + (ly - ty) * k).toFixed(2)}`);
  }
  const end = pts[N]!.split(',').map(Number);
  const glow = ramp(k, 0.85, 1);
  const pulse = 1 + 0.25 * Math.sin(s * 0.42) * glow;
  return (
    <Frame>
      <polyline points={pts.join(' ')} fill="none" stroke={c.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0.9} />
      <circle cx={end[0]} cy={end[1]} r={14 * pulse} fill={c.accentSoft} opacity={glow} />
      <circle cx={end[0]} cy={end[1]} r={5.5} fill={c.accent} opacity={0.3 + 0.7 * glow} />
    </Frame>
  );
};

// ─── TDAH : une bille de flipper qui rebondit d'un plot à l'autre ─────────
const BUMPERS = [
  {x: 70, y: 36},
  {x: 170, y: 32},
  {x: 120, y: 84},
];
// Parcours fermé : points de contact successifs (la boucle revient au début).
const BOUNCES = [
  {x: 24, y: 96},
  {x: 62, y: 44},
  {x: 110, y: 18},
  {x: 162, y: 40},
  {x: 216, y: 88},
  {x: 128, y: 76},
  {x: 82, y: 104},
  {x: 24, y: 96},
];

export const Attention: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const seg = 60 / (BOUNCES.length - 1);
  const pos = (step: number) => {
    const st = ((step % 60) + 60) % 60;
    const i = Math.min(Math.floor(st / seg), BOUNCES.length - 2);
    const u = Easing.out(Easing.quad)((st - i * seg) / seg);
    const a = BOUNCES[i]!;
    const b = BOUNCES[i + 1]!;
    return {x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u};
  };
  const ball = pos(s);
  const trail = Array.from({length: 9}, (_, j) => pos(s - (j + 1) * 0.55));
  // Un plot s'allume quand la bille passe près de lui.
  const hit = (b: {x: number; y: number}) => {
    const d = Math.hypot(ball.x - b.x, ball.y - b.y);
    return interpolate(d, [12, 30], [1, 0], clamp);
  };
  return (
    <Frame>
      {BUMPERS.map((b, i) => {
        const h = hit(b);
        return (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={11 + 5 * h} fill={c.accentSoft} opacity={h} />
            <circle cx={b.x} cy={b.y} r={9} fill={h > 0.2 ? c.accent : c.soft} stroke={c.accent} strokeOpacity={0.5 + 0.5 * h} strokeWidth={1.4} />
          </g>
        );
      })}
      {trail.map((p, j) => (
        <circle key={j} cx={p.x} cy={p.y} r={4.6 - j * 0.4} fill={c.primary} opacity={0.35 - j * 0.035} />
      ))}
      <circle cx={ball.x} cy={ball.y} r={5.2} fill={c.primary} />
    </Frame>
  );
};

// ─── TOP : une vague qui monte, déborde un instant, puis retombe ──────────
export const Wave: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  // Enveloppe : calme → montée → pic (≈ pas 26) → retour au calme.
  const env = Math.pow(Math.sin(Math.PI * ramp(s, 4, 52)), 2);
  const N = 90;
  const line = (phase: number, amp: number) =>
    Array.from({length: N + 1}, (_, i) => {
      const t = i / N;
      const x = 20 + t * 200;
      const y = 72 - amp * Math.sin(Math.PI * t) * Math.sin(t * TAU * 3 - s * 0.35 + phase);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  const amp = 4 + 34 * env;
  const spark = ramp(env, 0.8, 1);
  return (
    <Frame>
      <line x1={20} y1={100} x2={220} y2={100} stroke={c.ink} strokeOpacity={0.12} strokeWidth={1} />
      <polyline points={line(0, amp)} fill="none" stroke={interpolateColor(c.primary, c.accent, spark)} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      {[-1, 0, 1].map((j) => (
        <path key={j} d={`M ${120 + j * 16} ${22 - Math.abs(j) * 3} l ${j * 3} ${-6 * spark}`} stroke={c.accent} strokeWidth={2} strokeLinecap="round" opacity={spark} />
      ))}
    </Frame>
  );
};

function interpolateColor(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i]! - v) * t)).join(',')})`;
}

// ─── Autisme : des formes éparses qui s'alignent en un motif ordonné ──────
// Sensations et routines : les formes flottent, s'ordonnent (pas 14 à 26),
// restent alignées, puis repartent flotter.
const SHAPES = [
  {kind: 'circle', sx: 44, sy: 30},
  {kind: 'square', sx: 196, sy: 26},
  {kind: 'triangle', sx: 150, sy: 96},
  {kind: 'circle', sx: 92, sy: 98},
  {kind: 'square', sx: 30, sy: 84},
  {kind: 'triangle', sx: 206, sy: 78},
] as const;

export const Sensory: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const k = smooth(ramp(s, 12, 26)) * (1 - smooth(ramp(s, 44, 58)));
  return (
    <Frame>
      {SHAPES.map((sh, i) => {
        const drift = (1 - k) * 6;
        const x0 = sh.sx + drift * Math.sin(s * 0.1 + i * 1.7);
        const y0 = sh.sy + drift * Math.cos(s * 0.12 + i * 2.3);
        const x1 = 50 + i * 28;
        const y1 = 60;
        const x = x0 + (x1 - x0) * k;
        const y = y0 + (y1 - y0) * k;
        const rot = (1 - k) * (s * 3 + i * 40);
        const fill = i % 2 ? c.accent : c.primary;
        const r = 8;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
            {sh.kind === 'circle' && <circle r={r} fill={fill} />}
            {sh.kind === 'square' && <rect x={-r} y={-r} width={2 * r} height={2 * r} rx={2.5} fill={fill} />}
            {sh.kind === 'triangle' && <path d={`M 0 ${-r - 1} L ${r + 1} ${r} L ${-r - 1} ${r} Z`} fill={fill} strokeLinejoin="round" />}
          </g>
        );
      })}
      <line x1={36} x2={36 + 168 * k} y1={80} y2={80} stroke={c.ink} strokeOpacity={0.18 * k} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  );
};

// ─── Parcours complet : deux cercles qui se rejoignent et se superposent ──
export const Overlap: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const k = smooth(ramp(s, 6, 22)) * (1 - smooth(ramp(s, 44, 58)));
  const gap = 58 - 30 * k;
  const lens = ramp(k, 0.6, 1);
  const r = 32;
  return (
    <Frame>
      <defs>
        <clipPath id={`clip-${theme}`}>
          <circle cx={120 - gap / 2} cy={60} r={r} />
        </clipPath>
      </defs>
      <circle cx={120 - gap / 2} cy={60} r={r} fill={c.soft} stroke={c.primary} strokeWidth={2} />
      <circle cx={120 + gap / 2} cy={60} r={r} fill={c.accentSoft} stroke={c.accent} strokeWidth={2} />
      <circle cx={120 + gap / 2} cy={60} r={r} fill={c.primary} opacity={0.35 * lens} clipPath={`url(#clip-${theme})`} />
      <circle cx={120} cy={60} r={4} fill={c.ink} opacity={0.7 * lens} />
    </Frame>
  );
};

// ─── Résultat : un chemin à trois étapes qui s'allument l'une après l'autre ─
export const Path: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const d = 'M 22 92 C 60 92, 64 40, 102 40 S 150 88, 184 70 S 212 30, 222 28';
  const STOPS = [
    {x: 62, y: 62, at: 12},
    {x: 136, y: 66, at: 26},
    {x: 222, y: 28, at: 40},
  ];
  const draw = ramp(s, 2, 42);
  const fade = 1 - ramp(s, 52, 60);
  return (
    <Frame>
      <path d={d} fill="none" stroke={c.ink} strokeOpacity={0.14} strokeWidth={5} strokeLinecap="round" />
      <path d={d} fill="none" stroke={c.primary} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={fade} />
      {STOPS.map((p, i) => {
        const on = interpolate(s, [p.at, p.at + 4], [0, 1], {...clamp, easing: Easing.out(Easing.back(3))}) * fade;
        const last = i === STOPS.length - 1;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={9} fill={c.ink} fillOpacity={0.08} />
            <circle cx={p.x} cy={p.y} r={9 * on} fill={last ? c.accent : c.primary} />
            {last && <circle cx={p.x} cy={p.y} r={9 + 8 * on} fill="none" stroke={c.accent} strokeOpacity={0.5 * on} strokeWidth={2} />}
          </g>
        );
      })}
    </Frame>
  );
};
