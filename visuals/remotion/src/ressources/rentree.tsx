import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, Frame, inOut, LoopProps, ramp, THEMES, useSteps} from './common';

// Ce soir, trois choses : elles tombent dans le sac, le sac se ferme.
export const Bag: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s, 2);
  const items = [
    {x: 108, w: 12, h: 30, col: c.accent},
    {x: 122, w: 14, h: 24, col: c.warm},
    {x: 138, w: 8, h: 32, col: c.ink},
  ];
  const flap = ramp(s, 36, 42);
  return (
    <Frame>
      <g opacity={o}>
        {items.map(({x, w, h, col}, i) => {
          const t = interpolate(s, [6 + i * 9, 12 + i * 9], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
          const y = -h + (100 - h - 6 + h) * t;
          return <rect key={i} x={x} y={y - (t < 1 ? 0 : 0)} width={w} height={h} rx={3} fill={col} fillOpacity={i === 2 ? 0.45 : 0.8} opacity={t > 0 ? 1 : 0} />;
        })}
        <rect x={98} y={60} width={56} height={44} rx={10} fill={c.accentSoft} stroke={c.accent} strokeWidth={1.8} />
        <path d={`M 98 ${62 - 24 * (1 - flap)} Q 126 ${52 - 34 * (1 - flap)} 154 ${62 - 24 * (1 - flap)} L 154 ${62 + 10 * flap} Q 126 ${70 * flap + 40 * (1 - flap)} 98 ${62 + 10 * flap} Z`}
          fill={c.accent} fillOpacity={0.35 + 0.4 * flap} opacity={flap > 0 ? 1 : 0} />
        <path d="M 166 38 l 7 7 l 14 -14" fill="none" stroke={c.accent} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={32} strokeDashoffset={32 * (1 - ramp(s, 42, 47))} />
      </g>
    </Frame>
  );
};

// Une consigne à la fois : une seule carte à l'écran, cochée, puis la suivante.
export const OneAtATime: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const local = s % 20;
  const enter = interpolate(local, [0, 4], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const leave = interpolate(local, [15, 20], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const x = 60 * enter - 60 * leave;
  const op = 1 - Math.max(enter, leave);
  const tick = ramp(local, 8, 12);
  const widths = [52, 38, 46];
  const w = widths[Math.floor(s / 20) % 3];
  return (
    <Frame>
      <g transform={`translate(${x} 0)`} opacity={op}>
        <rect x={74} y={34} width={92} height={52} rx={10} fill={c.ink} fillOpacity={0.05} stroke={c.ink} strokeOpacity={0.3} strokeWidth={1.6} />
        <rect x={86} y={50} width={20} height={20} rx={5} fill={c.accentSoft} stroke={c.accent} strokeWidth={1.6} />
        <path d="M 90 60 l 4 4 l 8 -9" fill="none" stroke={c.accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={20} strokeDashoffset={20 * (1 - tick)} />
        <line x1={114} y1={60} x2={114 + w} y2={60} stroke={c.ink} strokeOpacity={0.4} strokeWidth={4} strokeLinecap="round" />
      </g>
    </Frame>
  );
};
