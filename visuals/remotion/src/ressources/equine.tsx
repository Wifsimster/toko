import React from 'react';
import {Frame, LoopProps, THEMES, useSteps, wave} from './common';

const SHOE = 'M -9 -10 C -12 0 -8 11 0 11 C 8 11 12 0 9 -10 L 5 -10 C 7 -2 5 6 0 6 C -5 6 -7 -2 -5 -10 Z';

// Pourquoi le cheval : des empreintes au pas, régulières, à quatre temps.
export const Gait: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const shift = (s / 60) * 96;
  return (
    <Frame>
      {Array.from({length: 10}, (_, i) => {
        const x = 236 - ((i * 24 + shift) % 240);
        const y = i % 2 ? 46 : 74;
        const edge = Math.min(1, x / 40, (236 - x) / 30);
        return (
          <path key={i} d={SHOE} transform={`translate(${x} ${y}) rotate(90)`}
            fill={i % 4 < 2 ? c.accent : c.warm} fillOpacity={0.75 * Math.max(0, edge)} />
        );
      })}
    </Frame>
  );
};

// La première séance : un fer à cheval qui se balance doucement sur son clou.
export const Horseshoe: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const a = 10 * wave(s, 2);
  return (
    <Frame>
      <circle cx={120} cy={22} r={3} fill={c.ink} fillOpacity={0.5} />
      <g transform={`rotate(${a} 120 22)`}>
        <line x1={120} y1={22} x2={120} y2={44} stroke={c.ink} strokeOpacity={0.3} strokeWidth={1.4} />
        <path d={SHOE} transform="translate(120 72) rotate(180) scale(2.8)" fill={c.warm} fillOpacity={0.9} />
      </g>
      {[0, 1].map((j) => (
        <circle key={j} cx={j ? 156 : 84} cy={j ? 52 : 86} r={2.4} fill={c.accent} opacity={0.2 + 0.6 * Math.max(0, wave(s, 2, j * Math.PI))} />
      ))}
    </Frame>
  );
};
