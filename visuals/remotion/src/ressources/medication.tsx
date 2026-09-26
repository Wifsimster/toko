import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, inOut, LoopProps, ramp, THEMES, useSteps} from './common';

// Ce qui compte vraiment : l'ajustement se fait par petits pas, jusqu'à
// tomber dans la bonne zone.
export const Adjust: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s);
  const step = (a: number) => interpolate(s, [a, a + 4], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const k = (step(8) + step(20) + step(32)) / 3;
  const x = 56 + 108 * k;
  const ok = ramp(s, 38, 42);
  return (
    <Frame>
      <g opacity={o}>
        <rect x={146} y={30} width={40} height={60} rx={8} fill={c.accentSoft} />
        <line x1={56} y1={60} x2={196} y2={60} stroke={c.ink} strokeOpacity={0.25} strokeWidth={4} strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={56 + i * 36} y1={70} x2={56 + i * 36} y2={76} stroke={c.ink} strokeOpacity={0.3} strokeWidth={1.6} />
        ))}
        <line x1={56} y1={60} x2={x} y2={60} stroke={c.accent} strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" />
        <circle cx={x} cy={60} r={9} fill={ok > 0 ? c.accent : c.ink} fillOpacity={ok > 0 ? 1 : 0.55} />
        <path d="M 160 22 l 5 5 l 10 -10" fill="none" stroke={c.accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={24} strokeDashoffset={24 * (1 - ramp(s, 42, 46))} />
      </g>
    </Frame>
  );
};

// Pas « d'abord tout essayer » : deux chemins qui avancent ensemble et se rejoignent.
export const Together: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const top = (t: number) => [24 + 96 * t, 30 + 30 * (1 - Math.cos(Math.PI * t)) / 2];
  const bot = (t: number) => [24 + 96 * t, 90 - 30 * (1 - Math.cos(Math.PI * t)) / 2];
  const pts = (f: (t: number) => number[]) => Array.from({length: 21}, (_, i) => f(i / 20).join(',')).join(' ');
  const pos = (u: number, f: (t: number) => number[]) => (u < 0.5 ? f(u * 2) : [120 + (u - 0.5) * 2 * 96, 60]);
  return (
    <Frame>
      <polyline points={pts(top)} fill="none" stroke={c.warm} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
      <polyline points={pts(bot)} fill="none" stroke={c.accent} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
      <line x1={120} y1={60} x2={216} y2={60} stroke={c.accent} strokeOpacity={0.45} strokeWidth={5} strokeLinecap="round" />
      {[0, 1, 2].map((j) => {
        const u = (s / 60 + j / 3) % 1;
        const fade = Math.min(1, u * 8, (1 - u) * 8);
        const [x1, y1] = pos(u, top);
        const [x2, y2] = pos(u, bot);
        return (
          <g key={j} opacity={fade}>
            <circle cx={x1} cy={y1} r={4.5} fill={c.warm} />
            <circle cx={x2} cy={y2} r={4.5} fill={c.accent} />
          </g>
        );
      })}
    </Frame>
  );
};
