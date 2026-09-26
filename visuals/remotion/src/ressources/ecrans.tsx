import React from 'react';
import {Frame, LoopProps, ramp, THEMES, useSteps} from './common';

// Neurodéveloppemental : une double hélice qui tourne sur elle-même.
export const Helix: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const ph = (s / 60) * 2 * Math.PI;
  const N = 14;
  return (
    <Frame>
      {Array.from({length: N}, (_, i) => {
        const x = 36 + i * 13;
        const a = (i / N) * 2 * Math.PI * 1.5 + ph;
        const y1 = 60 + 28 * Math.sin(a);
        const y2 = 60 - 28 * Math.sin(a);
        const front = Math.cos(a) > 0;
        return (
          <g key={i}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke={c.ink} strokeOpacity={0.15} strokeWidth={2} />
            <circle cx={x} cy={y1} r={front ? 5 : 3.5} fill={c.accent} fillOpacity={front ? 0.9 : 0.45} />
            <circle cx={x} cy={y2} r={front ? 3.5 : 5} fill={c.warm} fillOpacity={front ? 0.45 : 0.9} />
          </g>
        );
      })}
    </Frame>
  );
};

// Les règles qui marchent : un minuteur visible, puis l'écran s'éteint tout seul.
export const Timer: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const left = 1 - ramp(s, 2, 38) + ramp(s, 54, 60);
  const screen = 1 - ramp(s, 40, 44) + ramp(s, 54, 60);
  const R = 16;
  const L = 2 * Math.PI * R;
  return (
    <Frame>
      <rect x={52} y={22} width={96} height={72} rx={9} fill={c.ink} fillOpacity={0.06} stroke={c.ink} strokeOpacity={0.4} strokeWidth={1.6} />
      <rect x={58} y={28} width={84} height={60} rx={5} fill={c.accent} fillOpacity={0.12 + 0.4 * screen} />
      <circle cx={180} cy={58} r={R} fill="none" stroke={c.ink} strokeOpacity={0.15} strokeWidth={4} />
      <circle cx={180} cy={58} r={R} fill="none" stroke={c.warm} strokeWidth={4} strokeLinecap="round"
        strokeDasharray={L} strokeDashoffset={L * (1 - left)} transform="rotate(-90 180 58)" opacity={left > 0.001 ? 1 : 0} />
    </Frame>
  );
};
