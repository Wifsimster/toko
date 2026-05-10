import { z } from "zod";
import { TIME_OF_DAY, type TimeOfDay } from "./routine";

// Six ready-made templates surfaced on the Routines empty state so parents
// don't face a blank page. Curated with a pediatric neurologist + child psy
// + ADHD parent input — each step is a concrete observable action, sequence
// is fixed, and counts stay in the 3–7 working-memory window (Barkley).
//
// Template content lives client+server side (no DB seed) so adopting a
// template is a single transactional insert and templates can evolve with
// app releases without migrations.

export type RoutineTemplateStep = {
  label: string;
  emoji?: string;
  durationMinutes?: number;
};

export type RoutineTemplate = {
  key: string;
  title: string;
  emoji: string;
  timeOfDay: TimeOfDay;
  // Soft tag — surfaces visually so the "survival" template stands apart.
  tone?: "default" | "gentle";
  steps: RoutineTemplateStep[];
};

export const ROUTINE_TEMPLATES: readonly RoutineTemplate[] = [
  {
    key: "morning-school",
    title: "Matin d'école",
    emoji: "🌞",
    timeOfDay: "morning",
    steps: [
      { label: "Se lever et boire un verre d'eau", emoji: "💧", durationMinutes: 5 },
      { label: "Aller aux toilettes et se laver le visage", emoji: "🚿", durationMinutes: 5 },
      { label: "S'habiller (vêtements préparés la veille)", emoji: "👕", durationMinutes: 5 },
      { label: "Petit-déjeuner", emoji: "🥣", durationMinutes: 10 },
      { label: "Brosser les dents", emoji: "🪥", durationMinutes: 2 },
      { label: "Cartable et chaussures", emoji: "🎒", durationMinutes: 3 },
    ],
  },
  {
    key: "after-school",
    title: "Retour d'école",
    emoji: "🎒",
    timeOfDay: "evening",
    steps: [
      { label: "Poser le cartable au même endroit", emoji: "📚", durationMinutes: 1 },
      { label: "Goûter", emoji: "🍪", durationMinutes: 15 },
      { label: "20 min de défoulement (bouger, jouer dehors)", emoji: "🤸", durationMinutes: 20 },
      { label: "Vider le cahier de liaison avec le parent", emoji: "📒", durationMinutes: 5 },
    ],
  },
  {
    key: "homework",
    title: "Devoirs",
    emoji: "✏️",
    timeOfDay: "evening",
    steps: [
      { label: "Sortir le matériel et lire la consigne à voix haute", emoji: "📖", durationMinutes: 3 },
      { label: "Travail concentré (minuteur visible)", emoji: "⏱️", durationMinutes: 15 },
      { label: "Pause active", emoji: "🤾", durationMinutes: 5 },
      { label: "Relecture", emoji: "🔍", durationMinutes: 5 },
      { label: "Ranger le matériel", emoji: "🗂️", durationMinutes: 2 },
    ],
  },
  {
    key: "bedtime",
    title: "Coucher sans cris",
    emoji: "🌙",
    timeOfDay: "bedtime",
    steps: [
      { label: "Fin des écrans", emoji: "📵", durationMinutes: 1 },
      { label: "Douche ou bain tiède", emoji: "🛁", durationMinutes: 10 },
      { label: "Pyjama et brossage des dents", emoji: "🪥", durationMinutes: 5 },
      { label: "Préparer les affaires du lendemain", emoji: "🎒", durationMinutes: 5 },
      { label: "Lecture calme ou histoire", emoji: "📕", durationMinutes: 15 },
      { label: "Câlin et lumière éteinte", emoji: "🤍", durationMinutes: 2 },
    ],
  },
  {
    key: "transition",
    title: "Transition",
    emoji: "🔄",
    timeOfDay: "anytime",
    steps: [
      { label: "Annonce 5 min avant la fin", emoji: "🗣️", durationMinutes: 1 },
      { label: "Ranger l'activité en cours", emoji: "🧺", durationMinutes: 3 },
      { label: "Démarrer la suivante avec un signal", emoji: "🔔", durationMinutes: 1 },
    ],
  },
  {
    key: "rough-day",
    title: "Journée pourrie",
    emoji: "🫶",
    timeOfDay: "anytime",
    tone: "gentle",
    steps: [
      { label: "Médicament (si prescrit)", emoji: "💊" },
      { label: "Manger quelque chose", emoji: "🍽️" },
      { label: "Dormir", emoji: "😴" },
    ],
  },
];

export const ROUTINE_TEMPLATE_KEYS = ROUTINE_TEMPLATES.map((t) => t.key) as [
  string,
  ...string[],
];

export const adoptRoutineTemplateSchema = z.object({
  childId: z.string().uuid(),
  templateKey: z.enum(ROUTINE_TEMPLATE_KEYS),
});

export type AdoptRoutineTemplate = z.infer<typeof adoptRoutineTemplateSchema>;

export function findRoutineTemplate(key: string): RoutineTemplate | undefined {
  return ROUTINE_TEMPLATES.find((t) => t.key === key);
}

// Re-export for convenience to consumers that want both at once.
export { TIME_OF_DAY };
