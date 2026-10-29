import { moWaveAngle } from "./wave";

export type MoGestureName = "idee" | "saut";

type Keys = ReadonlyArray<readonly [number, number]>;

export type MoGesture = {
  durationMs: number;
  lift: Keys;
  stretch: Keys;
  macron: Keys;
};

const REST: Keys = [
  [0, 0],
  [1, 0],
];

export const MO_GESTURES: Record<MoGestureName, MoGesture> = {
  idee: {
    durationMs: 1400,
    lift: REST,
    stretch: [
      [0, 0],
      [0.45, 0.03],
      [0.85, 0],
      [1, 0],
    ],
    macron: [
      [0, 0],
      [0.3, 0],
      [0.55, -6],
      [0.75, -6],
      [1, 0],
    ],
  },
  saut: {
    durationMs: 1100,
    lift: [
      [0, 0],
      [0.2, 0],
      [0.42, -12],
      [0.64, 0],
      [1, 0],
    ],
    stretch: [
      [0, 0],
      [0.2, -0.05],
      [0.3, 0.03],
      [0.42, 0],
      [0.64, -0.04],
      [0.8, 0.01],
      [1, 0],
    ],
    macron: [
      [0, 0],
      [0.28, 3],
      [0.5, -3],
      [0.66, 3],
      [0.84, -1],
      [1, 0],
    ],
  },
};

export const MO_GESTURE_SHADOW_PER_UNIT = 0.012;

export type MoGesturePose = {
  lift: number;
  stretch: number;
  macron: number;
  shadow: number;
};

export function moGesturePose(gesture: MoGesture, t: number): MoGesturePose {
  const lift = moWaveAngle(gesture.lift, t);
  return {
    lift,
    stretch: moWaveAngle(gesture.stretch, t),
    macron: moWaveAngle(gesture.macron, t),
    shadow: 1 + lift * MO_GESTURE_SHADOW_PER_UNIT,
  };
}
