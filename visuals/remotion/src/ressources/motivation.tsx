import React from 'react';
import {Frame, LoopProps, ramp, THEMES, useSteps} from './common';

const star = (cx: number, cy: number, r: number) =>
  Array.from({length: 10}, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
  }).join(' ');

// L'aversion au délai : plus la récompense s'éloigne, plus elle rapetisse et pâlit.
export const Delay: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const d = (1 - Math.cos((s / 60) * 2 * Math.PI)) / 2;
  const x = 86 + 118 * d;
  return (
    <Frame>
      <line x1={50} y1={86.5} x2={214} y2={86.5} stroke={c.ink} strokeOpacity={0.2} strokeDasharray="3 5" />
      <circle cx={42} cy={72} r={14} fill={c.accent} fillOpacity={0.8} />
      <polygon points={star(x, 60, 20 / (1 + 2.6 * d))} fill={c.warm} fillOpacity={1 - 0.7 * d} />
    </Frame>
  );
};

// Immédiat, fréquent : un jeton tombe dans le bocal à chaque petit effort.
export const Jar: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const out = 1 - ramp(s, 52, 58);
  const slots = [
    [112, 90],
    [128, 90],
    [120, 80],
    [104, 80],
    [136, 80],
    [112, 70],
    [128, 70],
  ];
  return (
    <Frame>
      <path d="M 92 30 L 92 96 Q 92 102 98 102 L 142 102 Q 148 102 148 96 L 148 30" fill={c.accentSoft}
        stroke={c.accent} strokeOpacity={0.6} strokeWidth={1.8} strokeLinejoin="round" />
      <line x1={88} y1={30} x2={152} y2={30} stroke={c.accent} strokeOpacity={0.6} strokeWidth={2.4} strokeLinecap="round" />
      {slots.map(([x, y], i) => {
        const t = ramp(s, 3 + i * 6, 7 + i * 6);
        if (t === 0) return null;
        return <circle key={i} cx={x} cy={8 + (y - 8) * t * t} r={6.5} fill={c.warm} opacity={out} />;
      })}
    </Frame>
  );
};
