// Seul fichier de apps/mobile/src autorisé à contenir des emoji (voir
// scripts/check-no-emoji-mobile.mjs) : ce sont des clés de recherche, jamais
// affichées. Les colonnes `routines.emoji`, `routine_steps.emoji`,
// `barkley_*.icon` et `crisis_items.emoji` stockent un emoji (le site les
// écrit avec ses sélecteurs) ; l'app ne l'affiche jamais tel quel et le
// traduit ici en dessin de la direction « Mō ». En attendant une colonne
// `icon_key`, les sélecteurs de l'app enregistrent l'emoji canonique de
// chaque choix (`ICON_CHOICES`, `CRISIS_CHOICES`) pour que le site continue
// d'afficher quelque chose.
import type { PictoName } from "@focusflow/mo/child";
import {
  Bath,
  BookOpen,
  Candy,
  Footprints,
  Gamepad2,
  HandHeart,
  Headphones,
  Heart,
  HeartHandshake,
  Moon,
  Music,
  Palette,
  PawPrint,
  Pencil,
  Puzzle,
  Rainbow,
  Smile,
  Sparkles,
  Star,
  Tent,
  ToyBrick,
  TreeDeciduous,
  Tv,
  Volleyball,
  Wind,
  type LucideIcon,
} from "lucide-react-native";

/** Pictos d'étape de routine (`@focusflow/mo/child`). */
export type RoutinePicto = Extract<
  PictoName,
  "cartable" | "chaussette" | "dents" | "douche" | "habits" | "livre" | "pyjama"
>;

/** Pictogrammes des objectifs (`@focusflow/mo/icons`) repris dans l'app. */
export type MoIconName = "matins" | "couchers" | "encourager";

/** Un dessin de la direction « Mō » (jamais Mō lui-même : un objet). */
export type MoSpec = { kind: "picto"; name: RoutinePicto } | { kind: "mo-icon"; name: MoIconName };

/** Ce qu'un élément affiche à la place de son emoji. */
export type IconSpec = MoSpec | { kind: "lucide"; icon: LucideIcon };

/** D'où vient l'élément : la liste de crise n'a que des icônes (pas de Mō). */
export type IconKind = "routine" | "step" | "reward" | "behavior" | "crisis";

const picto = (name: RoutinePicto): MoSpec => ({ kind: "picto", name });
const moIcon = (name: MoIconName): MoSpec => ({ kind: "mo-icon", name });

// Le libellé passe d'abord (« Poser le cartable au même endroit » porte 📚),
// dans cet ordre : « Pyjama et brossage des dents » donne la brosse à dents,
// « Coucher sans cris » la lune.
const BY_LABEL: ReadonlyArray<readonly [MoSpec, RegExp]> = [
  [picto("chaussette"), /chaussette/i],
  [picto("dents"), /\bdents?\b|brossage/i],
  [picto("pyjama"), /pyjama/i],
  [picto("habits"), /habill|v[eê]tement|\bhabits?\b/i],
  [picto("cartable"), /cartable/i],
  [picto("douche"), /douche|\bbain\b/i],
  [picto("livre"), /\blivre|lecture|\blire\b|histoire|devoirs?\b/i],
  [moIcon("matins"), /\bmatin/i],
  [moIcon("couchers"), /coucher|\bdormir\b|\bdodo\b|\bnuit\b/i],
];

// Les emoji des modèles de routine (packages/validators), des comportements et
// récompenses par défaut (apps/api/src/lib/barkley-defaults.ts, seed) et des
// sélecteurs du site (apps/web/src/components/emoji-picker-data.ts) qui ont un
// dessin Mō. Les autres n'ont pas d'équivalent : l'app montre une initiale.
const BY_EMOJI: ReadonlyArray<readonly [MoSpec, readonly string[]]> = [
  [picto("chaussette"), ["🧦"]],
  [picto("dents"), ["🪥", "🦷"]],
  [picto("habits"), ["👕", "👚", "👗", "👖", "🩳", "🧥"]],
  [picto("cartable"), ["🎒"]],
  [picto("douche"), ["🚿", "🛁", "🧼"]],
  [picto("pyjama"), ["🛌"]],
  [picto("livre"), ["📕", "📖", "📚", "📗", "📘", "📙", "📒", "📓", "✏️", "📝"]],
  [moIcon("matins"), ["🌞", "☀️", "🌅", "🌄"]],
  [moIcon("couchers"), ["🌙", "🌛", "🌜", "😴", "💤"]],
  [moIcon("encourager"), ["⭐", "🌟"]],
];

/**
 * Liste de crise : des icônes lucide seulement (Mō n'y apparaît pas dans
 * cette version). Les huit choix de l'app, puis ceux du site et de la démo.
 */
export const CRISIS_CHOICES: ReadonlyArray<{ emoji: string; icon: LucideIcon; label: string }> = [
  { emoji: "💙", icon: Heart, label: "Cœur" },
  { emoji: "🧸", icon: ToyBrick, label: "Jouet" },
  { emoji: "🎵", icon: Music, label: "Musique" },
  { emoji: "📖", icon: BookOpen, label: "Livre" },
  { emoji: "🧘", icon: Wind, label: "Respirer" },
  { emoji: "🤗", icon: HeartHandshake, label: "Câlin" },
  { emoji: "🛁", icon: Bath, label: "Bain" },
  { emoji: "🐾", icon: PawPrint, label: "Animal" },
];

const CRISIS_EXTRA: ReadonlyArray<readonly [LucideIcon, readonly string[]]> = [
  [BookOpen, ["📚"]],
  [Tv, ["📺"]],
  [Sparkles, ["🫧", "✨", "🎪"]],
  [Pencil, ["🖍️", "✏️"]],
  [Footprints, ["🏃"]],
  [Gamepad2, ["🎮"]],
  [Puzzle, ["🧩"]],
  [Palette, ["🎨"]],
  [TreeDeciduous, ["🌳"]],
  [Moon, ["💤", "😴", "🌙"]],
  [Headphones, ["🎧"]],
  [HandHeart, ["🫂"]],
  [Volleyball, ["⚽"]],
  [Candy, ["🍫"]],
  [Star, ["⭐", "🌟"]],
  [Rainbow, ["🌈"]],
  [Tent, ["⛺"]],
  [Smile, ["😊", "🙂"]],
];

/** Icône par défaut d'un élément de la liste de crise. */
export const CRISIS_FALLBACK: LucideIcon = Heart;

/**
 * Les choix du sélecteur d'icône (routine et étape) : seulement des dessins
 * Mō. `emoji` est la valeur enregistrée (voir l'en-tête du fichier).
 */
export const ICON_CHOICES: ReadonlyArray<{ emoji: string; spec: MoSpec; label: string }> = [
  { emoji: "🌞", spec: moIcon("matins"), label: "Matin" },
  { emoji: "🌙", spec: moIcon("couchers"), label: "Coucher" },
  { emoji: "🧦", spec: picto("chaussette"), label: "Chaussettes" },
  { emoji: "👕", spec: picto("habits"), label: "Habits" },
  { emoji: "🪥", spec: picto("dents"), label: "Dents" },
  { emoji: "🚿", spec: picto("douche"), label: "Douche" },
  { emoji: "🛌", spec: picto("pyjama"), label: "Pyjama" },
  { emoji: "🎒", spec: picto("cartable"), label: "Cartable" },
  { emoji: "📖", spec: picto("livre"), label: "Livre" },
  { emoji: "⭐", spec: moIcon("encourager"), label: "Étoile" },
];

/** Sans le sélecteur de variante (U+FE0F), que le site ajoute parfois. */
export function normalizeEmoji(emoji: string | null | undefined): string {
  return (emoji ?? "").replace(/️/g, "").trim();
}

function findByEmoji<T>(table: ReadonlyArray<readonly [T, readonly string[]]>, emoji: string): T | undefined {
  if (!emoji) return undefined;
  return table.find(([, list]) => list.some((e) => normalizeEmoji(e) === emoji))?.[0];
}

/** Le dessin Mō qui correspond à un emoji enregistré, sans regarder le libellé. */
export function iconForEmoji(emoji: string | null | undefined): MoSpec | undefined {
  return findByEmoji(BY_EMOJI, normalizeEmoji(emoji));
}

/**
 * Ce qu'un élément affiche à la place de son emoji :
 * - liste de crise : une icône lucide (jamais `undefined`) ;
 * - ailleurs : un dessin Mō (picto d'étape ou pictogramme), d'après les mots
 *   du libellé puis l'emoji ; `undefined` s'il n'y en a pas, l'écran montre
 *   alors une initiale ou rien. Jamais l'emoji brut.
 */
export function iconFor(input: { label: string; emoji?: string | null; kind: "crisis" }): IconSpec;
export function iconFor(input: { label: string; emoji?: string | null; kind: Exclude<IconKind, "crisis"> }): MoSpec | undefined;
export function iconFor({ label, emoji, kind }: { label: string; emoji?: string | null; kind: IconKind }): IconSpec | undefined {
  const e = normalizeEmoji(emoji);
  if (kind === "crisis") {
    const icon =
      CRISIS_CHOICES.find((c) => normalizeEmoji(c.emoji) === e)?.icon ?? findByEmoji(CRISIS_EXTRA, e) ?? CRISIS_FALLBACK;
    return { kind: "lucide", icon };
  }
  return BY_LABEL.find(([, re]) => re.test(label))?.[0] ?? iconForEmoji(e);
}

/** Le picto d'étape à poser au centre du cadran du minuteur, s'il y en a un. */
export function pictoForStep(label: string, emoji?: string | null): RoutinePicto | undefined {
  const spec = iconFor({ label, emoji, kind: "step" });
  return spec?.kind === "picto" ? spec.name : undefined;
}
