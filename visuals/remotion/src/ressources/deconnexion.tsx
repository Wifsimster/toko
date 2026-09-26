import React from 'react';
import {interpolateColors} from 'remotion';
import {Frame, LoopProps, ramp, THEMES, useSteps, wave} from './common';

// Le figement : le point rebondit, ralentit, s'immobilise et pâlit. Un halo
// calme l'entoure, patient, jusqu'à ce que la couleur revienne.
export const Freeze: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const live = 1 - ramp(s, 14, 24) + ramp(s, 46, 56);
  const bounce = Math.abs(wave(s, 6)) * 30 * Math.min(1, live);
  const halo = ramp(s, 26, 34) * (1 - ramp(s, 48, 56));
  const breathe = 1 + 0.08 * wave(s, 2);
  return (
    <Frame>
      <line x1={80} y1={96.5} x2={160} y2={96.5} stroke={c.ink} strokeOpacity={0.2} />
      <circle cx={120} cy={60} r={34 * breathe} fill={c.accentSoft} opacity={halo} />
      <circle cx={120} cy={60} r={34 * breathe} fill="none" stroke={c.accent} strokeWidth={1.4} strokeOpacity={0.6 * halo} />
      <circle cx={120} cy={86 - bounce} r={10}
        fill={interpolateColors(Math.min(1, live), [0, 1], [c.ink, c.warm])} fillOpacity={0.35 + 0.55 * Math.min(1, live)} />
    </Frame>
  );
};

// Pourquoi c'est fréquent : la jauge se remplit jusqu'en haut, le
// disjoncteur coupe, puis tout redescend.
export const Overload: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const level = ramp(s, 2, 34) * (1 - ramp(s, 46, 58));
  const off = ramp(s, 36, 39) * (1 - ramp(s, 50, 54));
  const hot = ramp(level, 0.85, 0.95);
  const h = 76 * level;
  return (
    <Frame>
      <rect x={94} y={20} width={36} height={80} rx={8} fill="none" stroke={c.ink} strokeOpacity={0.35} strokeWidth={1.6} />
      <rect x={98} y={96 - h} width={28} height={h} rx={5} fill={c.accent} fillOpacity={(0.75 - 0.4 * off) * (1 - hot)} />
      <rect x={98} y={96 - h} width={28} height={h} rx={5} fill={c.warm} fillOpacity={(0.75 - 0.4 * off) * hot} />
      <rect x={146} y={46} width={18} height={28} rx={4} fill={c.ink} fillOpacity={0.06} stroke={c.ink} strokeOpacity={0.35} strokeWidth={1.4} />
      <line x1={155} y1={60} x2={155} y2={60 - 11 + 22 * off} stroke={off > 0.5 ? c.ink : c.accent}
        strokeOpacity={off > 0.5 ? 0.45 : 1} strokeWidth={4} strokeLinecap="round" />
    </Frame>
  );
};
