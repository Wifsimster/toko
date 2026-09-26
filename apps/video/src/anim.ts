import { Easing, interpolate, spring } from "remotion";

// Animations volontairement douces : pas de rebond, pas d'accélération brusque.
export const calm = (frame: number, fps: number, delay = 0, durationInFrames = 24) =>
  spring({ frame: frame - delay, fps, durationInFrames, config: { damping: 200 } });

export const fadeUp = (frame: number, fps: number, delay = 0, distance = 24) => {
  const p = calm(frame, fps, delay);
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` };
};

export const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
