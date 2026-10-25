/**
 * Le salut de Mō (`wave`, état « accueil ») : une fois à l'apparition, puis
 * Mō ne bouge plus (jamais en boucle, DIRECTION.md). La main tourne autour du
 * poignet (`MoArt.wave.pivot`), le corps s'incline à peine depuis le sol
 * (`MoArt.wave.ground`). Angles en degrés, sens horaire à l'écran.
 *
 * Le web joue les mêmes valeurs en CSS (`@keyframes mo-wave-*`, app.css) ;
 * l'app Expo les lit ici.
 */
export const MO_WAVE_DURATION_MS = 1200;

/** [instant entre 0 et 1, angle] : deux balancements et demi, retour à 0. */
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

/** Angle à l'instant `t` (0 à 1), adouci entre deux clés (sinus entrée-sortie). */
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
