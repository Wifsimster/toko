import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, inOut, LoopProps, ramp, THEMES, useSteps, wave} from './ressources/common';

// Page /formation : mêmes règles que les boucles /ressources (sans texte,
// fond transparent, mouvements lents), le miel en accent comme la page.

// Hero — 10 étapes : les points s'allument l'un après l'autre le long du
// chemin, le dernier devient une étoile qui rayonne, puis tout se rallume.
export const TenSteps: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s, 3, 54);
  const pts = Array.from({length: 10}, (_, i) => {
    const x = 26 + i * 20.9;
    return {x, y: 72 - i * 3.4 + 7 * Math.sin(i * 0.9)};
  });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const lit = (i: number) => ramp(s, 4 + i * 3.6, 6 + i * 3.6);
  const head = interpolate(s, [4, 4 + 9 * 3.6 + 2], [0, 9], clamp);
  const hi = Math.min(8, Math.floor(head));
  const hx = pts[hi].x + (pts[Math.min(9, hi + 1)].x - pts[hi].x) * (head - hi);
  const hy = pts[hi].y + (pts[Math.min(9, hi + 1)].y - pts[hi].y) * (head - hi);
  const star = ramp(s, 40, 44);
  const glow = star * (0.6 + 0.4 * wave(s, 2));
  const last = pts[9];
  const starPath = Array.from({length: 10}, (_, k) => {
    const r = k % 2 ? 4.2 : 10;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    return `${k ? 'L' : 'M'} ${(last.x + r * Math.cos(a)).toFixed(1)} ${(last.y + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ') + ' Z';
  return (
    <Frame>
      <g opacity={o}>
        <path d={d} fill="none" stroke={c.ink} strokeOpacity={0.14} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={c.warm} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray="1 2" strokeDashoffset={1.001 - head / 9} />
        {pts.slice(0, 9).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5.5} fill={c.ink} fillOpacity={0.08} stroke={c.ink} strokeOpacity={0.25} strokeWidth={1.2} />
            <circle cx={p.x} cy={p.y} r={5.5 * lit(i)} fill={c.warm} />
          </g>
        ))}
        <circle cx={last.x} cy={last.y} r={18 * glow} fill={c.warmSoft} />
        <circle cx={last.x} cy={last.y} r={5.5} fill={c.ink} fillOpacity={0.08 * (1 - star)} stroke={c.ink} strokeOpacity={0.25 * (1 - star)} strokeWidth={1.2} />
        <path d={starPath} fill={c.warm} opacity={star}
          transform={`rotate(${18 * star} ${last.x} ${last.y}) translate(${last.x} ${last.y}) scale(${0.4 + 0.6 * star}) translate(${-last.x} ${-last.y})`} />
        {head < 9 && <circle cx={hx} cy={hy} r={3} fill={c.accent} opacity={ramp(s, 3, 5)} />}
      </g>
    </Frame>
  );
};

// Comprendre — des points éparpillés se rangent dans un cadre clair et
// prévisible, puis se relâchent doucement.
export const Understand: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const t = interpolate(s, [6, 22], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)})
    * (1 - interpolate(s, [44, 58], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}));
  const scatter = [
    [74, 30], [152, 26], [98, 88], [170, 78], [128, 50], [84, 62], [146, 96], [110, 22], [180, 48],
  ];
  return (
    <Frame>
      <rect x={90} y={24} width={60} height={72} rx={10} fill={c.accentSoft} fillOpacity={t}
        stroke={c.accent} strokeWidth={1.8} strokeOpacity={0.3 + 0.7 * t} strokeDasharray={`${4 + 200 * t} 6`} />
      {scatter.map(([sx, sy], i) => {
        const gx = 104 + (i % 3) * 16;
        const gy = 42 + Math.floor(i / 3) * 18;
        const drift = (1 - t) * 3;
        const x = sx + (gx - sx) * t + drift * wave(s, 1, i);
        const y = sy + (gy - sy) * t + drift * wave(s, 2, i * 1.7);
        return <circle key={i} cx={x} cy={y} r={4.2} fill={i === 4 ? c.warm : c.accent} fillOpacity={0.55 + 0.4 * t} />;
      })}
    </Frame>
  );
};

// Agir — une consigne cochée, une étoile gagnée qui rejoint le tableau.
export const Act: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s, 3, 54);
  const slots = [0, 1, 2, 3, 4].map((i) => 92 + i * 22);
  const star = (cx: number, cy: number, r: number) =>
    Array.from({length: 10}, (_, k) => {
      const rr = k % 2 ? r * 0.42 : r;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      return `${k ? 'L' : 'M'} ${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    }).join(' ') + ' Z';
  // Trois cycles « coche → étoile » ; les deux premières étoiles sont déjà là.
  const cycles = [0, 1, 2].map((k) => {
    const a = 4 + k * 15;
    return {tick: ramp(s, a, a + 3), fly: interpolate(s, [a + 4, a + 10], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)}), k};
  });
  const cur = cycles.find((cy) => cy.fly < 1) ?? cycles[2];
  return (
    <Frame>
      <g opacity={o}>
        <rect x={34} y={30} width={30} height={30} rx={7} fill={c.accentSoft} stroke={c.accent} strokeWidth={1.8} />
        <path d="M 41 45 l 6 6 l 11 -12" fill="none" stroke={c.accent} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray="1 2" strokeDashoffset={1.001 - cur.tick * (1 - ramp(cur.fly, 0.8, 1))} />
        <rect x={80} y={70} width={120} height={30} rx={9} fill={c.ink} fillOpacity={0.05} stroke={c.ink} strokeOpacity={0.2} strokeWidth={1.4} />
        {slots.map((x, i) => {
          const filled = i < 2 || cycles.some((cy) => cy.k === i - 2 && cy.fly >= 1);
          return <path key={i} d={star(x, 85, 8)} fill={filled ? c.warm : 'none'} stroke={c.warm} strokeOpacity={filled ? 1 : 0.35} strokeWidth={1.2} strokeLinejoin="round" />;
        })}
        {cycles.map(({fly, k}) => {
          if (fly <= 0 || fly >= 1) return null;
          const tx = slots[k + 2];
          const x = 49 + (tx - 49) * fly;
          const y = 45 + (85 - 45) * fly - 26 * Math.sin(Math.PI * fly);
          return <path key={k} d={star(x, y, 8)} fill={c.warm} />;
        })}
      </g>
    </Frame>
  );
};

// Ancrer — une pousse sort de terre, ses racines s'enfoncent, les feuilles
// respirent au vent.
export const Anchor: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s, 3, 54);
  const g = interpolate(s, [4, 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const r = ramp(s, 10, 34);
  const sway = 4 * wave(s, 2) * g;
  const top = 76 - 44 * g;
  const leaf = ramp(s, 18, 30);
  const roots = [
    'M 120 78 Q 116 90 104 98 Q 96 102 88 110',
    'M 120 78 Q 122 94 120 112',
    'M 120 78 Q 126 88 140 96 Q 148 100 154 108',
  ];
  return (
    <Frame>
      <g opacity={o}>
        <line x1={60} y1={78} x2={180} y2={78} stroke={c.ink} strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round" />
        {roots.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={c.warm} strokeOpacity={0.75} strokeWidth={1.8} strokeLinecap="round"
            pathLength={1} strokeDasharray="1 2" strokeDashoffset={1.001 - ramp(r, i * 0.15, 0.7 + i * 0.15)} />
        ))}
        <path d={`M 120 78 Q ${120 + sway * 0.4} ${(78 + top) / 2} ${120 + sway} ${top}`} fill="none" stroke={c.accent} strokeWidth={2.6} strokeLinecap="round" />
        <g transform={`translate(${120 + sway * 0.7} ${top + 16}) rotate(${-30 + 6 * wave(s, 2, 0.6)}) scale(${leaf})`}>
          <path d="M 0 0 Q 10 -10 22 -4 Q 12 6 0 0 Z" fill={c.accent} fillOpacity={0.75} />
        </g>
        <g transform={`translate(${120 + sway * 0.85} ${top + 8}) rotate(${210 + 6 * wave(s, 2, 1.2)}) scale(${leaf})`}>
          <path d="M 0 0 Q 10 -10 22 -4 Q 12 6 0 0 Z" fill={c.accent} fillOpacity={0.55} transform="scale(1 -1)" />
        </g>
        <circle cx={120 + sway} cy={top} r={3.4 * g} fill={c.accent} />
      </g>
    </Frame>
  );
};

// Pratique — la semaine se coche jour après jour et la courbe de
// progression monte avec elle.
export const Practice: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s, 3, 54);
  const day = (i: number) => ramp(s, 5 + i * 5.5, 8 + i * 5.5);
  const vals = [0.2, 0.35, 0.3, 0.5, 0.6, 0.72, 0.9];
  const px = (i: number) => 58 + i * 20.7;
  const py = (i: number) => 64 - 38 * vals[i];
  const d = vals.map((_, i) => `${i ? 'L' : 'M'} ${px(i).toFixed(1)} ${py(i).toFixed(1)}`).join(' ');
  const prog = interpolate(s, [5, 5 + 6 * 5.5 + 3], [0, 1], clamp);
  return (
    <Frame>
      <g opacity={o}>
        <path d={d} fill="none" stroke={c.accent} strokeOpacity={0.12} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={c.accent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray="1 2" strokeDashoffset={1.001 - prog} />
        {vals.map((_, i) => {
          const t = day(i);
          return (
            <g key={i}>
              <circle cx={px(i)} cy={py(i)} r={3.2 * t} fill={c.accent} />
              <rect x={px(i) - 8} y={80} width={16} height={16} rx={4} fill={t > 0 ? c.warmSoft : 'none'}
                stroke={t > 0 ? c.warm : c.ink} strokeOpacity={t > 0 ? 1 : 0.25} strokeWidth={1.4} />
              <path d={`M ${px(i) - 4} 88 l 3 3 l 6 -7`} fill="none" stroke={c.warm} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                pathLength={1} strokeDasharray="1 2" strokeDashoffset={1.001 - t} />
            </g>
          );
        })}
      </g>
    </Frame>
  );
};
