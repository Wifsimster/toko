// French copy mirrored verbatim from the web app's i18n
// (apps/web/src/lib/i18n/locales/fr.json → eveningCheck) so the mobile screen
// keeps the exact guilt-free lexicon (business rule B7). Inlined rather than
// pulling i18next into the mobile app for a single screen.
export const eveningCheck = {
  title: "La soirée de ce soir ?",
  vibe_hard: "Difficile",
  vibe_ok: "Moyenne",
  vibe_top: "Top",
  painPrompt: "Quelle étape a été la plus dure ?",
  pain_shower: "Douche",
  pain_homework: "Devoirs",
  pain_bedtime: "Coucher",
  pain_meal: "Repas",
  cancel: "Annuler",
  saved: "Bilan de la soirée enregistré",
  edit: "Modifier la réponse",
  viewCalm: "Voir les minutes calmes",
} as const;

// Mirrors fr.json → calmMinutes (the dashboard card variant). Same guilt-free
// framing: a factual memory of calm, not a score to beat.
export const calmMinutes = {
  title: "Minutes de calme cette semaine",
  total: (minutes: number) => `${minutes} min`,
  average: (minutes: number, days: number) =>
    `Moyenne de ${minutes} min/jour sur ${days} j notés`,
  empty: "Commencez à noter vos soirées pour voir le calme s'accumuler.",
} as const;

// Mirrors fr.json → journal (+ tags). Guilt-free placeholder kept verbatim.
export const journal = {
  title: "Journal",
  writeButton: "Écrire",
  newEntry: "Nouvelle entrée",
  notes: "Notes",
  notesPlaceholder: "Une victoire, une difficulté, une stratégie qui a aidé…",
  tags: "Tags",
  addEntry: "Ajouter l'entrée",
  saving: "Enregistrement...",
  cancel: "Annuler",
  empty: "Votre journal est vide. Commencez à écrire vos premières observations.",
  delete: "Supprimer",
} as const;

// Mirrors fr.json → routines (mobile = execute the routine, authoring stays
// on web).
export const routines = {
  title: "Routines",
  today: "Aujourd'hui",
  noneToday: "Aucune routine prévue aujourd'hui.",
  done: "fait",
  allDone: "Bravo, routine terminée !",
  authorHint: "Créez et modifiez vos routines sur le site.",
  minutes: "min",
} as const;

export const journalTagLabels: Record<string, string> = {
  school: "École",
  victory: "Victoire",
  crisis: "Crise",
  medication: "Traitement",
  sleep: "Sommeil",
  sport: "Sport",
  therapy: "Thérapie",
};
