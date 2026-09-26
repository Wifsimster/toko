import React from 'react';
import {Frame, LoopProps, ramp, THEMES, useSteps} from './common';

// Les 6 fonctions exécutives autour d'un même centre ; elles s'allument l'une
// après l'autre, en rond.
export const Six: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  return (
    <Frame>
      {Array.from({length: 6}, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        const x = 120 + 40 * Math.cos(a);
        const y = 60 + 40 * Math.sin(a);
        const local = (s - i * 10 + 60) % 60;
        const k = ramp(local, 0, 4) * (1 - ramp(local, 10, 16));
        return (
          <g key={i}>
            <line x1={120} y1={60} x2={x} y2={y} stroke={k > 0.02 ? c.accent : c.ink} strokeOpacity={0.18 + 0.6 * k} strokeWidth={1.6} />
            <circle cx={x} cy={y} r={9 + 2 * k} fill={c.accent} fillOpacity={0.15 + 0.7 * k} stroke={c.accent} strokeOpacity={0.5} strokeWidth={1.2} />
          </g>
        );
      })}
      <circle cx={120} cy={60} r={12} fill={c.ink} fillOpacity={0.12} stroke={c.ink} strokeOpacity={0.4} strokeWidth={1.4} />
    </Frame>
  );
};

// La mémoire de travail : un plateau à 3 places. Chaque nouvelle consigne
// qui entre fait tomber la plus ancienne.
export const Tray: React.FC<LoopProps> = ({theme}) => {
  const c = THEMES[theme];
  const s = useSteps();
  const shift = (s / 60) * 72;
  return (
    <Frame>
      <rect x={70} y={42} width={100} height={40} rx={8} fill={c.accentSoft} stroke={c.accent} strokeOpacity={0.5} strokeWidth={1.4} />
      {Array.from({length: 5}, (_, i) => {
        const x = 214 - ((shift + i * 36) % 180);
        const inTray = x >= 72 && x <= 168 ? 1 : 0;
        const fall = Math.max(0, 70 - x);
        const enter = Math.min(1, Math.max(0, (214 - x) / 30));
        return (
          <rect key={i} x={x - 13} y={49 + fall * fall * 0.02} width={26} height={26} rx={6}
            fill={inTray ? c.accent : c.ink} fillOpacity={(inTray ? 0.8 : 0.3) * enter * Math.max(0, 1 - fall / 40)} />
        );
      })}
    </Frame>
  );
};
