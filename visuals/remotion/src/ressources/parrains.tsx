import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, LoopProps, ramp, THEMES, useSteps} from './common';

// Une place à part : un quatrième point rejoint la famille et s'y relie.
export const Join: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const out = 1 - ramp(s, 52, 60);
  const arrive = interpolate(s, [2, 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const nx = 226 - 50 * arrive;
  const fam = [
    [70, 36],
    [104, 84],
    [48, 84],
  ];
  const glow = ramp(s, 34, 48);
  return (
    <Frame>
      <polygon points={fam.map((p) => p.join(',')).join(' ')} fill="none" stroke={c.ink} strokeOpacity={0.25} strokeWidth={1.6} />
      {fam.map(([x, y], i) => {
        const k = ramp(s, 20 + i * 4, 26 + i * 4);
        return (
          <line key={i} x1={nx} y1={60} x2={nx + (x - nx) * k} y2={60 + (y - 60) * k}
            stroke={c.accent} strokeWidth={1.6} strokeOpacity={0.7 * out} />
        );
      })}
      {fam.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 12 : 9} fill={c.ink} fillOpacity={0.3} />
      ))}
      <circle cx={nx} cy={60} r={12 + glow * 18} fill="none" stroke={c.accent} strokeOpacity={0.6 * (1 - glow) * (glow > 0 ? 1 : 0)} strokeWidth={1.4} />
      <circle cx={nx} cy={60} r={11} fill={c.accent} opacity={arrive * out} />
    </Frame>
  );
};

// Ce qu'un parent épuisé attend de vous : que sa batterie remonte un peu.
export const Recharge: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const level = 1 + Math.floor(4 * ramp(s, 10, 42)) - Math.floor(4 * ramp(s, 48, 59.9));
  return (
    <Frame>
      <rect x={76} y={36} width={80} height={48} rx={8} fill="none" stroke={c.ink} strokeOpacity={0.4} strokeWidth={2} />
      <rect x={157} y={50} width={7} height={20} rx={2} fill={c.ink} fillOpacity={0.4} />
      {Array.from({length: 5}, (_, i) => (
        <rect key={i} x={82 + i * 14.5} y={42} width={11} height={36} rx={3}
          fill={level <= 1 ? c.warm : c.accent} fillOpacity={i < level ? 0.85 : 0.08} />
      ))}
    </Frame>
  );
};
