import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, inOut, LoopProps, ramp, THEMES, useSteps} from './common';

const line = (y: number, amp: number, k: number, s: number) =>
  Array.from({length: 49}, (_, i) => {
    const x = 30 + i * 3.75;
    return `${x},${y + amp * Math.sin((x / 180) * 2 * Math.PI * k - (s / 60) * 2 * Math.PI * 3)}`;
  }).join(' ');

// Co-réguler avant de corriger : l'onde agitée de l'enfant se cale peu à peu
// sur l'onde calme du parent.
export const Sync: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s);
  const calm = interpolate(s, [8, 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const amp = 20 - 13 * calm;
  const k = 5 - 3 * calm;
  return (
    <Frame>
      <g opacity={o}>
        <polyline points={line(34, 7, 2, s)} fill="none" stroke={c.accent} strokeWidth={2.4} strokeLinecap="round" />
        {[c.warm, c.accent].map((col, i) => (
          <polyline key={i} points={line(84, amp, k, s)} fill="none" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
            stroke={col} opacity={i ? calm : 1 - calm} />
        ))}
      </g>
    </Frame>
  );
};

// Réparer après avoir craqué : les deux moitiés du cœur se rejoignent.
export const Repair: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s);
  const join = interpolate(s, [12, 28], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const d = 9 * (1 - join);
  const glow = ramp(s, 28, 44);
  const left = 'M120,46 C120,38 111,26 97,26 C76,26 66,44 72,62 C78,78 100,92 120,104 Z';
  const right = 'M120,46 C120,38 129,26 143,26 C164,26 174,44 168,62 C162,78 140,92 120,104 Z';
  return (
    <Frame>
      <g opacity={o}>
        <circle cx={120} cy={62} r={34 + glow * 22} fill="none" stroke={c.accent} strokeWidth={1.6}
          strokeOpacity={0.6 * (1 - glow) * (glow > 0 ? 1 : 0)} />
        <path d={left} transform={`translate(${-d} ${d * 0.3}) rotate(${-d * 0.6} 120 104)`} fill={c.accent} fillOpacity={0.8} />
        <path d={right} transform={`translate(${d} ${d * 0.3}) rotate(${d * 0.6} 120 104)`} fill={c.accent} fillOpacity={0.8} />
      </g>
    </Frame>
  );
};
