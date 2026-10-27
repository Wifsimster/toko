import type { Routine, TimeOfDay } from "./routine";

// Accueil mobile, carte « une seule chose » : l'action la plus utile du
// moment, et rien d'autre. Logique pure (sans React ni requête), testée dans
// src/__tests__/home-focus.test.ts ; l'écran (apps/mobile HomeScreen) ne fait
// que lire les données et afficher le résultat.

/** Une routine du jour, réduite à ce que l'accueil affiche. */
export type HomeRoutine = {
  id: string;
  name: string;
  emoji: string | null;
  timeOfDay: TimeOfDay;
  stepCount: number;
  doneCount: number;
};

/** L'action proposée par la carte, dans l'ordre de priorité. */
export type HomeFocus =
  /** Deux jours ou plus sans relevé : noter la journée. */
  | { kind: "catch-up"; days: number }
  /** 17 h ou plus, soirée pas encore notée : le point du soir. */
  | { kind: "evening" }
  /** Une routine du moment pas encore finie. */
  | { kind: "routine"; routine: HomeRoutine }
  /** Soirée notée et plus rien à faire : Mō en fierté. */
  | { kind: "all-done" }
  /** Rien ne presse, mais la soirée n'est pas encore notée (avant 17 h). */
  | { kind: "nothing-pressing" };

/** Heure à partir de laquelle la carte propose le point du soir. */
export const EVENING_HOUR = 17;

/** Jours sans relevé à partir desquels la carte propose de noter la journée. */
export const CATCH_UP_DAYS = 2;

// Plage horaire où une routine est « du moment » ([début, fin[, en heures
// locales). Ordre d'affichage : celui de la journée. « anytime » vaut toute
// la journée, après midi pour l'ordre.
const SLOTS: Record<TimeOfDay, { order: number; start: number; end: number }> = {
  morning: { order: 0, start: 0, end: 12 },
  noon: { order: 1, start: 11, end: 15 },
  anytime: { order: 2, start: 0, end: 24 },
  evening: { order: 3, start: 16, end: 22 },
  bedtime: { order: 4, start: 18, end: 24 },
};

/** Jour de la semaine au format des routines : 0 = lundi … 6 = dimanche. */
export function mondayBasedDay(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Les routines prévues ce jour-là (actives, jour de la semaine compris, au
 * moins une étape), dans l'ordre de la journée, avec leurs étapes faites.
 */
export function todaysRoutines(
  routines: readonly Routine[],
  completedStepIds: ReadonlySet<string>,
  date: Date,
): HomeRoutine[] {
  const day = mondayBasedDay(date);
  return routines
    .filter(
      (r) =>
        r.active &&
        r.steps.length > 0 &&
        (r.daysOfWeek.length === 0 || r.daysOfWeek.includes(day)),
    )
    .sort(
      (a, b) =>
        SLOTS[a.timeOfDay].order - SLOTS[b.timeOfDay].order ||
        a.position - b.position,
    )
    .map((r) => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      timeOfDay: r.timeOfDay,
      stepCount: r.steps.length,
      doneCount: r.steps.filter((s) => completedStepIds.has(s.id)).length,
    }));
}

function unfinished(r: HomeRoutine): boolean {
  return r.doneCount < r.stepCount;
}

/** La première routine pas finie dont c'est le moment, s'il y en a une. */
export function currentRoutine(
  routines: readonly HomeRoutine[],
  hour: number,
): HomeRoutine | null {
  return (
    routines.find(
      (r) =>
        unfinished(r) &&
        hour >= SLOTS[r.timeOfDay].start &&
        hour < SLOTS[r.timeOfDay].end,
    ) ?? null
  );
}

/**
 * La routine à montrer en ligne sous la carte : la première pas finie dont
 * le moment n'est pas passé, hors celle que la carte propose déjà. Une
 * routine du matin pas finie à 15 h n'est plus rappelée.
 */
export function upcomingRoutine(
  routines: readonly HomeRoutine[],
  hour: number,
  exceptId?: string,
): HomeRoutine | null {
  return (
    routines.find(
      (r) => r.id !== exceptId && unfinished(r) && hour < SLOTS[r.timeOfDay].end,
    ) ?? null
  );
}

/**
 * La seule chose à proposer, dans cet ordre :
 * 1. deux jours ou plus sans relevé : noter la journée ;
 * 2. à partir de 17 h, soirée pas notée : le point du soir ;
 * 3. la routine du moment pas encore finie ;
 * 4. sinon rien à faire : « tout est noté » si la soirée l'est, « rien ne
 *    presse » avant (on ne dit pas « tout est noté » à 10 h).
 */
export function pickHomeFocus(input: {
  hour: number;
  /** `null` : aucun relevé encore (pas de rattrapage à proposer). */
  daysSinceLastEntry: number | null;
  eveningDone: boolean;
  routines: readonly HomeRoutine[];
}): HomeFocus {
  const { hour, daysSinceLastEntry, eveningDone, routines } = input;
  if (!eveningDone && daysSinceLastEntry != null && daysSinceLastEntry >= CATCH_UP_DAYS) {
    return { kind: "catch-up", days: daysSinceLastEntry };
  }
  if (!eveningDone && hour >= EVENING_HOUR) return { kind: "evening" };
  const routine = currentRoutine(routines, hour);
  if (routine) return { kind: "routine", routine };
  return eveningDone ? { kind: "all-done" } : { kind: "nothing-pressing" };
}
