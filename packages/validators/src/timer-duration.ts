// Minuteur visuel de l'app Android (apps/mobile) : la durée que le parent
// règle à la roue, minutes et secondes. Logique pure, testée dans
// src/__tests__/timer-duration.test.ts ; l'écran ne fait que l'afficher.
//
// Deux colonnes, pas trois : un minuteur pour un enfant compte des minutes
// (brossage de dents, transition, devoirs), rarement plus d'une heure. Une
// colonne des heures ajouterait une roue presque toujours à zéro. Les
// secondes avancent de 5 en 5 : 30 s ou 1 min 30 se règlent sans viser une
// seconde précise.

/** Plus grande valeur de la colonne des minutes. */
export const TIMER_MAX_MINUTES = 99;

/** Pas de la colonne des secondes. */
export const TIMER_SECOND_STEP = 5;

/** Plus longue durée réglable : 99 min 55 s. */
export const TIMER_MAX_SEC = TIMER_MAX_MINUTES * 60 + (60 - TIMER_SECOND_STEP);

/** Valeurs de la colonne des minutes : 0 à 99. */
export const TIMER_MINUTE_VALUES: readonly number[] = Array.from(
  { length: TIMER_MAX_MINUTES + 1 },
  (_, i) => i,
);

/** Valeurs de la colonne des secondes : 0, 5, … 55. */
export const TIMER_SECOND_VALUES: readonly number[] = Array.from(
  { length: 60 / TIMER_SECOND_STEP },
  (_, i) => i * TIMER_SECOND_STEP,
);

/**
 * Ramène une durée (en secondes) sur la roue : arrondie au pas des secondes,
 * entre 0 et `TIMER_MAX_SEC`. Une valeur qui n'est pas un nombre fini vaut 0.
 */
export function clampTimerDuration(sec: number): number {
  if (!Number.isFinite(sec) || sec <= 0) return 0;
  const stepped = Math.round(sec / TIMER_SECOND_STEP) * TIMER_SECOND_STEP;
  return Math.min(TIMER_MAX_SEC, stepped);
}

/** Durée → position des deux roues (après `clampTimerDuration`). */
export function splitTimerDuration(sec: number): { minutes: number; seconds: number } {
  const total = clampTimerDuration(sec);
  return { minutes: Math.floor(total / 60), seconds: total % 60 };
}

/** Position des deux roues → durée en secondes (bornée). */
export function composeTimerDuration(minutes: number, seconds: number): number {
  return clampTimerDuration(minutes * 60 + seconds);
}

/**
 * Durée affichée à l'ouverture du minuteur : la dernière durée lancée,
 * gardée sur l'appareil (texte brut lu dans le stockage). Rien d'enregistré,
 * ou une valeur illisible : 0, et le parent choisit (roue ou puce). L'app ne
 * propose jamais une durée que le parent n'a pas choisie lui-même.
 */
export function resolveInitialTimerDuration(stored: string | null | undefined): number {
  if (stored == null || stored.trim() === "") return 0;
  const n = Number(stored);
  return Number.isInteger(n) ? clampTimerDuration(n) : 0;
}
