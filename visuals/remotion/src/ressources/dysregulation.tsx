import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, inOut, LoopProps, ramp, THEMES, useSteps} from './common';

// L'alarme part tout de suite, le frein arrive en retard : le signal met du
// temps à traverser jusqu'à lui.
export const Alarm: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s, 2);
  const travel = interpolate(s, [10, 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const brake = ramp(s, 40, 46);
  return (
    <Frame>
      <g opacity={o}>
        <line x1={78} y1={60} x2={162} y2={60} stroke={c.ink} strokeOpacity={0.2} strokeWidth={2} strokeDasharray="3 5" />
        {[0, 1].map((j) => {
          const t = ramp(s, 2 + j * 5, 16 + j * 5);
          return <circle key={j} cx={60} cy={60} r={16 + t * 26} fill="none" stroke={c.warm} strokeWidth={1.6} strokeOpacity={0.8 * (1 - t) * (t > 0 ? 1 : 0)} />;
        })}
        <circle cx={60} cy={60} r={16} fill={c.warm} fillOpacity={0.85} />
        {travel > 0 && travel < 1 && <circle cx={78 + 84 * travel} cy={60} r={4} fill={c.warm} />}
        <circle cx={180} cy={60} r={16} fill={c.accentSoft} stroke={c.accent} strokeWidth={1.6} strokeOpacity={0.5} />
        <circle cx={180} cy={60} r={16 * brake} fill={c.accent} fillOpacity={0.85} />
      </g>
    </Frame>
  );
};

// Le cercle vicieux : deux points qui se poursuivent sur la même boucle.
export const Circle: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const a = (s / 60) * 2 * Math.PI;
  const R = 38;
  const at = (ang: number) => [120 + R * Math.cos(ang), 60 + R * Math.sin(ang)];
  const trail = (ang: number) =>
    Array.from({length: 12}, (_, i) => at(ang - (i / 11) * 1.1)).map((p) => p.join(',')).join(' ');
  const [x1, y1] = at(a);
  const [x2, y2] = at(a + Math.PI);
  return (
    <Frame>
      <circle cx={120} cy={60} r={R} fill="none" stroke={c.ink} strokeOpacity={0.15} strokeWidth={2} />
      <polyline points={trail(a)} fill="none" stroke={c.accent} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
      <polyline points={trail(a + Math.PI)} fill="none" stroke={c.warm} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
      <circle cx={x1} cy={y1} r={8} fill={c.accent} />
      <circle cx={x2} cy={y2} r={6} fill={c.warm} />
    </Frame>
  );
};
