// Behavior decoder catalogue. Each entry describes a recurring TDAH
// behaviour the way a parent would phrase it (first-person observation),
// then explains the neuropsychological mechanism in plain French, and
// finally suggests one actionable response. The goal is to replace
// guilt ("I'm a bad parent") with understanding.
//
// Content adapted from popular vulgarisation: Russell Barkley
// (executive function model), Caroline Goldman, INSERM dossier TDAH.
// Each card avoids the word "diagnostic" per `docs/freemium-ethics-policy.md`
// § 5 — this is psychoeducation, not a clinical statement.

export type BehaviorEntry = {
  /** Stable id, used as React key + i18n suffix. */
  id: string;
  /** i18n keys under `decoder.entries.<id>.behavior|explanation|tip` */
  /** Tags drive the simple search. Stored as lower-case French words. */
  tags: readonly string[];
};

export const BEHAVIOR_ENTRIES: readonly BehaviorEntry[] = [
  {
    id: "throwsBackpack",
    tags: ["école", "retour", "agressif", "affaires", "transition"],
  },
  {
    id: "interrupts",
    tags: ["interrompt", "coupe la parole", "impulsivité", "discussion"],
  },
  {
    id: "losesStuff",
    tags: ["perd", "cartable", "doudou", "gourde", "oubli", "mémoire"],
  },
  {
    id: "forgetsInstructions",
    tags: ["oublie", "consigne", "répéter", "mémoire", "écoute"],
  },
  {
    id: "wontFinish",
    tags: ["finir", "abandonne", "motivation", "lassitude"],
  },
  {
    id: "fidgets",
    tags: ["bouge", "agite", "mains", "pieds", "attention"],
  },
  {
    id: "explosiveAnger",
    tags: ["crise", "colère", "explosion", "émotion", "régulation"],
  },
  {
    id: "liesToAvoid",
    tags: ["mensonge", "ment", "évite", "corvée", "devoirs"],
  },
  {
    id: "cantStartHomework",
    tags: ["devoirs", "commencer", "démarrer", "procrastination"],
  },
  {
    id: "screenTransition",
    tags: ["écran", "jeu vidéo", "tablette", "arrêter", "transition"],
  },
  {
    id: "eveningMeltdown",
    tags: ["soir", "pleure", "effondrement", "fatigue"],
  },
  {
    id: "tableMovement",
    tags: ["table", "repas", "bouge", "agité"],
  },
  {
    id: "doesntListen",
    tags: ["école", "n'écoute pas", "attention", "instit", "maîtresse"],
  },
  {
    id: "slowToGetDressed",
    tags: ["habille", "matin", "lent", "distraction"],
  },
  {
    id: "givesUpEarly",
    tags: ["abandonne", "échec", "renoncement", "estime"],
  },
] as const;
