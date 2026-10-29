export const MO_WAVE_DURATION_MS = 1200;

export const MO_WAVE_HAND: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.16, 14],
  [0.36, -9],
  [0.56, 12],
  [0.76, -5],
  [1, 0],
];

export const MO_WAVE_BODY: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.22, -1.5],
  [0.7, -1.5],
  [1, 0],
];

export function moWaveAngle(keys: ReadonlyArray<readonly [number, number]>, t: number): number {
  let previous: readonly [number, number] | undefined;
  for (const key of keys) {
    const [t1, a1] = key;
    if (t <= t1) {
      if (!previous) return a1;
      const [t0, a0] = previous;
      const k = (t - t0) / (t1 - t0);
      return a0 + ((a1 - a0) * (1 - Math.cos(Math.PI * k))) / 2;
    }
    previous = key;
  }
  return previous?.[1] ?? 0;
}
