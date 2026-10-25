import { moWaveAngle } from "./wave";

/**
 * Petits gestes de Mō, joués une fois à l'apparition (et au toucher), puis
 * Mō ne bouge plus : jamais en boucle (DIRECTION.md). Même mécanique que le
 * salut (`wave.ts`) : des clés `[instant entre 0 et 1, valeur]`, adoucies
 * entre deux clés, qui partent de 0 et y reviennent, donc la dernière image
 * est la pose statique.
 *
 * Les valeurs sont en unités de la viewBox (le personnage fait 200 de haut) :
 * - `lift` : le corps monte (négatif) depuis le sol (`MoArt.ground`) ;
 * - `stretch` : le corps s'étire (positif) ou se tasse (négatif) en hauteur
 *   depuis le sol, en proportion ; la largeur compense de moitié ;
 * - `macron` : le macron monte (négatif) en plus du corps.
 * L'ombre au sol rétrécit quand le corps monte (`MO_GESTURE_SHADOW_PER_UNIT`).
 */
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
  /**
   * « Mot de passe oublié », Mō calme : une inspiration lente depuis le sol,
   * et au sommet le macron se lève un peu, comme une idée (« on va le
   * retrouver »), puis tout se repose.
   */
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
  /**
   * E-mail envoyé, Mō bravo : un petit saut de confirmation. Mō se tasse,
   * décolle, retombe en s'écrasant à peine ; le macron suit avec un temps de
   * retard.
   */
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

/** Rétrécissement de l'ombre par unité de montée du corps. */
export const MO_GESTURE_SHADOW_PER_UNIT = 0.012;

export type MoGesturePose = {
  lift: number;
  stretch: number;
  macron: number;
  /** Échelle horizontale de l'ombre au sol (1 au repos). */
  shadow: number;
};

/** La pose du geste à l'instant `t` (0 à 1). À 0 et à partir de 1 : la pose statique. */
export function moGesturePose(gesture: MoGesture, t: number): MoGesturePose {
  const lift = moWaveAngle(gesture.lift, t);
  return {
    lift,
    stretch: moWaveAngle(gesture.stretch, t),
    macron: moWaveAngle(gesture.macron, t),
    shadow: 1 + lift * MO_GESTURE_SHADOW_PER_UNIT,
  };
}
