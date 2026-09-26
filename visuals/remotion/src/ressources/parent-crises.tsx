import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, LoopProps, ramp, THEMES, useSteps, wave} from './common';

// Le parent épuisé : le sablier s'écoule, puis on le retourne.
export const Hourglass: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const t = ramp(s, 2, 44);
  const flip = interpolate(s, [48, 58], [0, 180], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const top = 1 - t;
  return (
    <Frame>
      <g transform={`rotate(${flip} 120 60)`}>
        <line x1={96} y1={20} x2={144} y2={20} stroke={c.ink} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
        <line x1={96} y1={100} x2={144} y2={100} stroke={c.ink} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
        <path d="M 102 22 L 102 30 Q 102 46 117 58 L 117 62 Q 102 74 102 90 L 102 98 L 138 98 L 138 90 Q 138 74 123 62 L 123 58 Q 138 46 138 30 L 138 22 Z"
          fill="none" stroke={c.ink} strokeOpacity={0.35} strokeWidth={1.6} strokeLinejoin="round" />
        <path d={`M ${104 + 12 * (1 - top)} ${56 - 30 * top} L ${136 - 12 * (1 - top)} ${56 - 30 * top} L 120 58 Z`} fill={c.warm} fillOpacity={top > 0.01 ? 0.85 : 0} />
        <path d={`M 104 96 L 136 96 L ${120 + 16 * (1 - t * 0.4)} ${96 - 28 * t} L ${120 - 16 * (1 - t * 0.4)} ${96 - 28 * t} Z`} fill={c.warm} fillOpacity={t > 0.01 ? 0.85 : 0} />
        {t > 0 && t < 1 && <line x1={120} y1={60} x2={120} y2={94} stroke={c.warm} strokeWidth={1.4} />}
      </g>
    </Frame>
  );
};

// 90 secondes : on inspire, on expire, l'anneau du temps fait le tour.
export const Breathe: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const b = (1 - wave(s, 2, Math.PI / 2)) / 2;
  const R = 44;
  const L = 2 * Math.PI * R;
  const prog = ramp(s, 0, 54);
  const ring = 1 - ramp(s, 54, 60);
  return (
    <Frame>
      <circle cx={120} cy={60} r={R} fill="none" stroke={c.ink} strokeOpacity={0.1} strokeWidth={3} />
      <circle cx={120} cy={60} r={R} fill="none" stroke={c.accent} strokeWidth={3} strokeLinecap="round"
        strokeDasharray={L} strokeDashoffset={L * (1 - prog)} transform="rotate(-90 120 60)" opacity={ring} />
      <circle cx={120} cy={60} r={14 + 20 * b} fill={c.accent} fillOpacity={0.18 + 0.2 * b} />
      <circle cx={120} cy={60} r={8} fill={c.accent} fillOpacity={0.85} />
    </Frame>
  );
};
