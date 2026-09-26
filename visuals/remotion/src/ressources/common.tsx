import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Petites boucles sans texte, façon GIF, posées sous un titre de section des
// articles /ressources. Fond transparent : seules l'encre et les accents
// changent avec le thème (valeurs de --foreground, --primary et --chart-3 dans
// apps/web/src/app.css). Mouvements lents et doux : le lecteur est un parent
// TDAH fatigué, une boucle ne doit jamais clignoter ni surprendre.
export type LoopProps = {theme: 'light' | 'dark'; slug: string; still: number};

export const THEMES = {
  light: {
    ink: '#23272d',
    accent: '#1a7c73',
    accentSoft: 'rgba(26,124,115,0.16)',
    warm: '#d19853',
    warmSoft: 'rgba(209,152,83,0.2)',
  },
  dark: {
    ink: '#e9eaec',
    accent: '#7fd6cb',
    accentSoft: 'rgba(127,214,203,0.2)',
    warm: '#e7b375',
    warmSoft: 'rgba(231,179,117,0.22)',
  },
};

// 4 s par boucle, 480×240 ; durée et cadence sont réglées par boucle dans Root.
export const W = 240;
export const H = 120;

export const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {children}
    </svg>
  </AbsoluteFill>
);

// Temps de la boucle exprimé sur 60 pas, quelle que soit la cadence :
// les minutages s'écrivent une fois, en « pas ».
export const useSteps = () => {
  const f = useCurrentFrame();
  const n = useVideoConfig().durationInFrames;
  return (f / n) * 60;
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// 0 → 1 entre a et b (en pas)
export const ramp = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], clamp);
// Oscillation qui retombe exactement sur ses pieds en fin de boucle (k tours entiers).
export const wave = (s: number, k: number, phase = 0) => Math.sin((2 * Math.PI * k * s) / 60 + phase);
// Fondu d'entrée et de sortie de la boucle : 0 aux deux bouts, 1 au milieu.
export const inOut = (s: number, a = 4, b = 52) => ramp(s, 0, a) * (1 - ramp(s, b, 60));
