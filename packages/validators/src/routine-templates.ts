import { z } from "zod";
import { TIME_OF_DAY, type TimeOfDay } from "./routine";

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
  daysOfWeek?: number[];
  tone?: "default" | "gentle";
  steps: RoutineTemplateStep[];
};

export const SCHOOL_DAYS = [0, 1, 3, 4] as const;

export const ROUTINE_TEMPLATES: readonly RoutineTemplate[] = [
  {
    key: "morning-school",
    title: "Matin d'école",
    emoji: "🌞",
    timeOfDay: "morning",
    daysOfWeek: [...SCHOOL_DAYS],
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
    daysOfWeek: [...SCHOOL_DAYS],
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
    daysOfWeek: [...SCHOOL_DAYS],
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

export { TIME_OF_DAY };
