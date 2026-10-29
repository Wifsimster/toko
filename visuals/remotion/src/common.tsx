import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export type LoopProps = {theme: 'light'; still: number};

export const THEMES = {
  light: {ink: '#23272d', primary: '#1a7c73', soft: 'rgba(26,124,115,0.16)', accent: '#c39a3e', accentSoft: 'rgba(195,154,62,0.22)'},
};

export const LOOP = {seconds: 3, width: 480, height: 240};
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
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const TAU = Math.PI * 2;
