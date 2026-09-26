import React from 'react';
import {Frame, LoopProps, ramp, THEMES, useSteps} from './common';

const House: React.FC<{c: (typeof THEMES)['light']; x: number}> = ({c, x}) => (
  <path d={`M ${x - 34} 52 L ${x} 22 L ${x + 34} 52 L ${x + 34} 102 L ${x - 34} 102 Z`}
    fill={c.ink} fillOpacity={0.04} stroke={c.ink} strokeOpacity={0.35} strokeWidth={1.6} strokeLinejoin="round" />
);

// Deux maisons, les mêmes 5 règles : elles s'allument ensemble, des deux côtés.
export const TwoHomes: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  return (
    <Frame>
      <House c={c} x={68} />
      <House c={c} x={172} />
      <line x1={106} y1={78} x2={134} y2={78} stroke={c.accent} strokeOpacity={0.5} strokeWidth={1.6} strokeDasharray="3 4" />
      {[68, 172].map((hx) =>
        Array.from({length: 5}, (_, i) => {
          const local = (s - i * 12 + 60) % 60;
          const k = ramp(local, 0, 3) * (1 - ramp(local, 10, 14));
          return <circle key={`${hx}-${i}`} cx={hx - 20 + i * 10} cy={78} r={3.4 + k} fill={c.accent} fillOpacity={0.25 + 0.7 * k} />;
        }),
      )}
    </Frame>
  );
};

// Se relayer : le relais passe d'un parent à l'autre, sans se disputer le rôle.
export const Relay: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const t = (1 - Math.cos((s / 60) * 2 * Math.PI)) / 2;
  const x = 64 + 112 * t;
  const y = 62 - 34 * Math.sin(Math.PI * t);
  return (
    <Frame>
      <path d="M 64 62 Q 120 -6 176 62" fill="none" stroke={c.ink} strokeOpacity={0.15} strokeWidth={1.6} strokeDasharray="3 5" />
      <circle cx={52} cy={80} r={18} fill={c.accent} fillOpacity={0.3 + 0.5 * (1 - t)} />
      <circle cx={188} cy={80} r={18} fill={c.accent} fillOpacity={0.3 + 0.5 * t} />
      <circle cx={x} cy={y} r={7} fill={c.warm} />
    </Frame>
  );
};
