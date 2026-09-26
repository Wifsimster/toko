import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, inOut, LoopProps, ramp, THEMES, useSteps, wave} from './common';

// Ce qu'il ressent et ne dit pas : la bulle hésite, puis un cœur apparaît.
export const Unsaid: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s);
  const dots = 1 - ramp(s, 28, 32);
  const heart = interpolate(s, [32, 40], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return (
    <Frame>
      <g opacity={o}>
        <rect x={82} y={24} width={76} height={52} rx={16} fill={c.accentSoft} stroke={c.accent} strokeWidth={1.6} />
        <path d="M 102 76 L 96 92 L 116 76" fill={c.accentSoft} stroke={c.accent} strokeWidth={1.6} strokeLinejoin="round" />
        {[0, 1, 2].map((j) => (
          <circle key={j} cx={106 + j * 14} cy={50 - 4 * Math.max(0, wave(s, 6, -j * 0.9))} r={4} fill={c.accent} opacity={dots} />
        ))}
        <path transform={`translate(120 50) scale(${heart * 0.9}) translate(-120 -50)`}
          d="M120,62 C104,52 100,44 104,38 C108,32 116,33 120,40 C124,33 132,32 136,38 C140,44 136,52 120,62 Z"
          fill={c.warm} />
      </g>
    </Frame>
  );
};

// Une présence calme : le petit rond s'agite, puis respire au rythme du grand.
export const Presence: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const agit = 1 - ramp(s, 6, 30) + ramp(s, 54, 60);
  const breathe = 1 + 0.06 * wave(s, 2);
  const jx = 4 * agit * wave(s, 11);
  const jy = 3 * agit * wave(s, 7, 1);
  return (
    <Frame>
      <line x1={60} y1={96.5} x2={180} y2={96.5} stroke={c.ink} strokeOpacity={0.25} strokeWidth={2} strokeLinecap="round" />
      <circle cx={100} cy={96 - 26 * breathe} r={26 * breathe} fill={c.accent} fillOpacity={0.7} />
      <circle cx={148 + jx} cy={96 - 14 * breathe + jy} r={14 * breathe} fill={c.warm} fillOpacity={0.85} />
    </Frame>
  );
};
