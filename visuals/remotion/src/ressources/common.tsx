import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export type LoopProps = {theme: 'light'; slug: string; still: number};

export const THEMES = {
  light: {
    ink: '#23272d',
    accent: '#1a7c73',
    accentSoft: 'rgba(26,124,115,0.16)',
    warm: '#d19853',
    warmSoft: 'rgba(209,152,83,0.2)',
  },
};

export const W = 240;
export const H = 120;

export const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {children}
    </svg>
  </AbsoluteFill>
);

export const useSteps = () => {
  const f = useCurrentFrame();
  const n = useVideoConfig().durationInFrames;
  return (f / n) * 60;
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ramp = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], clamp);
export const wave = (s: number, k: number, phase = 0) => Math.sin((2 * Math.PI * k * s) / 60 + phase);
export const inOut = (s: number, a = 4, b = 52) => ramp(s, 0, a) * (1 - ramp(s, b, 60));
