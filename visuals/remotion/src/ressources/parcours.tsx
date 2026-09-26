import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, inOut, LoopProps, ramp, THEMES, useSteps} from './common';

// Le parcours de soins : un chemin sinueux, six étapes qui s'allument au
// passage du point.
const at = (t: number) => [28 + 184 * t, 62 + 26 * Math.sin(2 * Math.PI * 1.25 * t)];

export const Path: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s, 3);
  const t = interpolate(s, [4, 48], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const pts = (a: number, b: number) =>
    Array.from({length: 61}, (_, i) => at(a + ((b - a) * i) / 60).join(',')).join(' ');
  const [px, py] = at(t);
  return (
    <Frame>
      <g opacity={o}>
        <polyline points={pts(0, 1)} fill="none" stroke={c.ink} strokeOpacity={0.15} strokeWidth={3} strokeLinecap="round" />
        {t > 0 && <polyline points={pts(0, t)} fill="none" stroke={c.accent} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />}
        {Array.from({length: 6}, (_, i) => {
          const [x, y] = at(i / 5);
          const on = t >= i / 5 - 0.001;
          return <circle key={i} cx={x} cy={y} r={6} fill={on ? c.accent : c.ink} fillOpacity={on ? 0.85 : 0.15} />;
        })}
        <circle cx={px} cy={py} r={4} fill={c.warm} />
      </g>
    </Frame>
  );
};

// Vous n'êtes pas seul·e : autour de vous, le cercle se relie, lien après lien.
export const NotAlone: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const out = 1 - ramp(s, 50, 58);
  const rot = (s / 60) * (Math.PI / 3);
  return (
    <Frame>
      {Array.from({length: 6}, (_, i) => {
        const a = rot + (i * Math.PI) / 3;
        const x = 120 + 44 * Math.cos(a);
        const y = 60 + 40 * Math.sin(a);
        const k = ramp(s, 4 + i * 6, 10 + i * 6) * out;
        return (
          <g key={i}>
            <line x1={120} y1={60} x2={120 + (x - 120) * k} y2={60 + (y - 60) * k} stroke={c.accent} strokeOpacity={0.6} strokeWidth={1.6} />
            <circle cx={x} cy={y} r={7} fill={c.accent} fillOpacity={0.2 + 0.65 * k} />
          </g>
        );
      })}
      <circle cx={120} cy={60} r={12} fill={c.warm} fillOpacity={0.9} />
    </Frame>
  );
};
