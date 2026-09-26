import React from 'react';
import {Frame, LoopProps, ramp, THEMES, useSteps, wave} from './common';

const Moon: React.FC<{c: (typeof THEMES)['light']; x: number; y: number; r: number; id: string}> = ({c, x, y, r, id}) => (
  <>
    <mask id={id}>
      <rect x={0} y={0} width={240} height={120} fill="white" />
      <circle cx={x + r * 0.55} cy={y - r * 0.35} r={r * 0.9} fill="black" />
    </mask>
    <circle cx={x} cy={y} r={r} fill={c.warm} mask={`url(#${id})`} />
  </>
);

// Pourquoi il dort mal : la lune est là, mais l'horloge continue de tourner.
export const Clock: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const a = (s / 60) * 720 - 90;
  const stars = [
    [40, 30, 0],
    [72, 18, 1.5],
    [60, 92, 3],
    [196, 22, 4.2],
  ];
  return (
    <Frame>
      <Moon c={c} x={82} y={60} r={24} id={`moon-${theme}`} />
      {stars.map(([x, y, ph], i) => (
        <circle key={i} cx={x} cy={y} r={2.2} fill={c.warm} opacity={0.35 + 0.35 * wave(s, 2, ph)} />
      ))}
      <circle cx={160} cy={60} r={26} fill="none" stroke={c.ink} strokeOpacity={0.4} strokeWidth={1.8} />
      {Array.from({length: 12}, (_, i) => {
        const t = (i * Math.PI) / 6;
        return <circle key={i} cx={160 + 21 * Math.cos(t)} cy={60 + 21 * Math.sin(t)} r={1.2} fill={c.ink} fillOpacity={0.4} />;
      })}
      <line x1={160} y1={60} x2={160 + 18 * Math.cos((a * Math.PI) / 180)} y2={60 + 18 * Math.sin((a * Math.PI) / 180)}
        stroke={c.accent} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={160} y1={60} x2={160 + 11 * Math.cos(((a / 12 - 60) * Math.PI) / 180)} y2={60 + 11 * Math.sin(((a / 12 - 60) * Math.PI) / 180)}
        stroke={c.ink} strokeOpacity={0.6} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={160} cy={60} r={2.4} fill={c.ink} fillOpacity={0.6} />
    </Frame>
  );
};

// La routine du soir : les lumières s'éteignent une à une, la lune se lève.
export const Lights: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const back = ramp(s, 52, 60);
  const moon = ramp(s, 34, 42) * (1 - back);
  return (
    <Frame>
      {Array.from({length: 4}, (_, i) => {
        const on = 1 - ramp(s, 6 + i * 7, 9 + i * 7) + back;
        const x = 36 + i * 30;
        return (
          <g key={i}>
            <line x1={x} y1={10} x2={x} y2={36} stroke={c.ink} strokeOpacity={0.25} strokeWidth={1.2} />
            <circle cx={x} cy={48} r={16} fill={c.warmSoft} opacity={on} />
            <circle cx={x} cy={48} r={8} fill={c.warm} fillOpacity={0.15 + 0.75 * on} />
          </g>
        );
      })}
      <g opacity={moon} transform={`translate(0 ${12 * (1 - moon)})`}>
        <Moon c={c} x={186} y={58} r={20} id={`moon2-${theme}`} />
        <circle cx={214} cy={34} r={2} fill={c.warm} opacity={0.7} />
        <circle cx={160} cy={84} r={2} fill={c.warm} opacity={0.5} />
      </g>
      <line x1={20} y1={100.5} x2={220} y2={100.5} stroke={c.ink} strokeOpacity={0.15} />
    </Frame>
  );
};
