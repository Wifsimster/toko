import React from 'react';
import {Frame, inOut, LoopProps, ramp, THEMES, useSteps} from './common';

// Courbe d'une crise : montée, explosion, redescente. Le point la parcourt,
// la bande de la phase en cours s'éclaire.
const X0 = 24;
const X1 = 216;
const curve = (t: number) => 96 - 66 * Math.exp(-(((t - 0.45) / 0.16) ** 2));
const pts = (a: number, b: number) =>
  Array.from({length: 61}, (_, i) => a + ((b - a) * i) / 60)
    .map((t) => `${X0 + (X1 - X0) * t},${curve(t)}`)
    .join(' ');

export const Phases: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = inOut(s);
  const t = ramp(s, 4, 50);
  const bands = [
    [0.18, 0.36],
    [0.36, 0.56],
    [0.56, 0.86],
  ];
  const heat = Math.exp(-(((t - 0.45) / 0.16) ** 2));
  return (
    <Frame>
      <g opacity={o}>
        {bands.map(([a, b], i) => {
          const on = t >= a && t < b ? 1 : 0;
          return (
            <rect key={i} x={X0 + (X1 - X0) * a + 1} y={14} width={(X1 - X0) * (b - a) - 2} height={88} rx={6}
              fill={i === 1 ? c.warmSoft : c.accentSoft} opacity={0.35 + 0.65 * on} />
          );
        })}
        <line x1={X0} y1={100.5} x2={X1} y2={100.5} stroke={c.ink} strokeOpacity={0.2} />
        <polyline points={pts(0, 1)} fill="none" stroke={c.ink} strokeOpacity={0.18} strokeWidth={2} strokeLinecap="round" />
        {t > 0 && (
          <polyline points={pts(0, t)} fill="none" stroke={c.accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        )}
        <circle cx={X0 + (X1 - X0) * t} cy={curve(t)} r={5} fill={c.accent} />
        <circle cx={X0 + (X1 - X0) * t} cy={curve(t)} r={5} fill={c.warm} opacity={heat} />
      </g>
    </Frame>
  );
};

// La bonne nouvelle : semaine après semaine, les barres baissent.
export const Fewer: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const o = 1 - ramp(s, 52, 60);
  const hs = [78, 70, 74, 58, 50, 40, 33, 24];
  const trend = ramp(s, 34, 46);
  return (
    <Frame>
      <line x1={36} y1={100.5} x2={204} y2={100.5} stroke={c.ink} strokeOpacity={0.2} />
      {hs.map((h, i) => {
        const k = ramp(s, 2 + i * 4, 6 + i * 4);
        const hh = h * k;
        return (
          <rect key={i} x={44 + i * 20} y={100 - hh} width={12} height={hh} rx={3}
            fill={i < 3 ? c.warm : c.accent} fillOpacity={(0.35 + 0.45 * (i / 7)) * o} />
        );
      })}
      <line x1={50} y1={20} x2={50 + (190 - 50) * trend} y2={20 + (72 - 20) * trend}
        stroke={c.accent} strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" opacity={o} />
    </Frame>
  );
};
