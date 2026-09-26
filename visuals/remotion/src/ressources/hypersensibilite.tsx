import React from 'react';
import {Frame, LoopProps, THEMES, useSteps, wave} from './common';

// Les 5 canaux sensoriels : chacun a son niveau, et certains dépassent la
// ligne du supportable.
export const Channels: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const LIMIT = 34;
  const cfg = [
    [44, 14, 1, 0],
    [56, 22, 2, 1],
    [40, 16, 1, 2.2],
    [58, 26, 2, 3.4],
    [46, 12, 1, 4.6],
  ];
  return (
    <Frame>
      <line x1={50} y1={LIMIT} x2={190} y2={LIMIT} stroke={c.warm} strokeWidth={1.4} strokeDasharray="4 4" strokeOpacity={0.8} />
      <line x1={50} y1={100.5} x2={190} y2={100.5} stroke={c.ink} strokeOpacity={0.2} />
      {cfg.map(([base, amp, k, ph], i) => {
        const h = base + amp * wave(s, k, ph);
        const over = 100 - h < LIMIT;
        return <rect key={i} x={62 + i * 26} y={100 - h} width={16} height={h} rx={4} fill={over ? c.warm : c.accent} fillOpacity={over ? 0.9 : 0.6} />;
      })}
    </Frame>
  );
};

// Aménager : un filtre en forme de casque. Le bruit entre fort, ressort doux.
export const Filter: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const line = (x0: number, x1: number, amp: number, k: number) =>
    Array.from({length: 31}, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / 30;
      return `${x},${60 + amp * Math.sin((x / 24) * k - (s / 60) * 2 * Math.PI * 2)}`;
    }).join(' ');
  return (
    <Frame>
      <polyline points={line(24, 104, 22, 2.4)} fill="none" stroke={c.warm} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 112 26 A 34 34 0 0 1 112 94" fill="none" stroke={c.ink} strokeOpacity={0.45} strokeWidth={6} strokeLinecap="round" />
      <rect x={104} y={22} width={12} height={20} rx={4} fill={c.ink} fillOpacity={0.35} />
      <rect x={104} y={78} width={12} height={20} rx={4} fill={c.ink} fillOpacity={0.35} />
      <polyline points={line(140, 216, 5, 1.2)} fill="none" stroke={c.accent} strokeWidth={2.2} strokeLinecap="round" />
    </Frame>
  );
};
