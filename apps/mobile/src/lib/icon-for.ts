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
export type RoutinePicto = Exclude<PictoName, "oeuf-0" | "oeuf-1" | "oeuf-2" | "oeuf-3" | "oeuf-ouvert">;

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
// dans cet ordre : l'objet nommé avant l'action (« Pyjama et brossage des
// dents » donne la brosse à dents, « Ranger le cartable » le cartable),
// « Relecture » avant « lecture », « Câlin et lumière éteinte » le cœur.
// Chaque étape d'un modèle de routine a son propre dessin (test :
// icon-for.test.ts). Les pictogrammes de paysage (lune, soleil levant)
// viennent en dernier : « Coucher sans cris » garde la lune.
const BY_LABEL: ReadonlyArray<readonly [MoSpec, RegExp]> = [
  [picto("chaussette"), /chaussette/i],
  [picto("dents"), /\bdents?\b|brossage/i],
  [picto("pyjama"), /pyjama/i],
  [picto("habits"), /habill|v[eê]tement|\bhabits?\b/i],
  [picto("cartable"), /cartable/i],
  [picto("chaussures"), /chaussure|basket|bottes?\b|\bsouliers?\b/i],
  [picto("douche"), /douche|\bbain\b/i],
  [picto("lavabo"), /toilette|\bwc\b|\bpipi\b|lavabo|visage|(laver|lave) les mains|\bmains\b/i],
  [picto("verre"), /\bboire\b|\bverre\b|\beau\b|hydrat/i],
  [picto("bol"), /petit[- ]d[ée]j|c[ée]r[ée]ales|\bbol\b/i],
  [picto("gouter"), /go[uû]ter|collation|biscuit|\bsnack/i],
  [picto("repas"), /\brepas\b|d[ée]jeuner|d[îi]ner|souper|manger|cantine|(^|\s)[àa] table\b/i],
  [picto("medicament"), /m[ée]dicament|m[ée]doc|traitement|sirop|pilule|comprim[ée]|g[ée]lule|vitamine|\bfer\b/i],
  [picto("calin"), /c[aâ]lin|bisou|tendresse/i],
  [picto("lampe"), /lumi[eè]re|lampe|veilleuse/i],
  [picto("ecran"), /[ée]crans?\b.*(fin|[ée]tein|coup|ranger|pos)|fin des [ée]crans|sans [ée]cran|[ée]teindre|tablette|t[ée]l[ée](\s|$)|t[ée]l[ée]vision/i],
  [picto("cahier"), /cahier|liaison|agenda/i],
  [picto("sablier"), /minuteur|sablier|chrono|concentr|travail/i],
  [picto("ballon"), /pause|bouger|d[ée]foul|\bsport|jouer dehors|courir|sauter|\bballon|\bv[ée]lo\b|[ée]tirement/i],
  [picto("loupe"), /relecture|\brelire|v[ée]rifier|loupe/i],
  [picto("rangement"), /\brang(er|e|ement)\b/i],
  [picto("bulle"), /annonce|pr[ée]venir|\bavertir|\brappel/i],
  [picto("cloche"), /signal|cloche|sonnerie|\bgong\b/i],
  [picto("crayon"), /[ée]crire|dessin|colori|crayon/i],
  [picto("livre"), /\blivre|lecture|\blire\b|histoire|devoirs?\b/i],
  [picto("oreiller"), /\bdormir\b|\bdodo\b|sieste|oreiller|\bdors\b/i],
  [moIcon("matins"), /\bmatin/i],
  [moIcon("couchers"), /coucher|\bnuit\b/i],
];

// La routine elle-même garde ses pictogrammes de paysage : une routine
// « Dodo » ou « Dormir » montre la lune, pas l'oreiller d'une étape.
const ROUTINE_LABEL: ReadonlyArray<readonly [MoSpec, RegExp]> = [
  [moIcon("couchers"), /\bdormir\b|\bdodo\b/i],
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
  [picto("chaussures"), ["👟", "👞", "🥾", "👢"]],
  [picto("douche"), ["🚿", "🛁", "🧼"]],
  [picto("lavabo"), ["🚽", "🧻", "🙌", "🤲"]],
  [picto("pyjama"), ["🛌"]],
  [picto("verre"), ["💧", "🥛", "🚰", "🥤"]],
  [picto("bol"), ["🥣"]],
  [picto("gouter"), ["🍪", "🍎", "🍌", "🧁"]],
  [picto("repas"), ["🍽️", "🍴", "🥗", "🍝"]],
  [picto("medicament"), ["💊", "🩹"]],
  [picto("calin"), ["🤍", "❤️", "💗", "💕", "🤗", "🫂", "🫶"]],
  [picto("lampe"), ["💡", "🕯️"]],
  [picto("ecran"), ["📵", "📱", "📺"]],
  [picto("cahier"), ["📒", "📓", "📔"]],
  [picto("sablier"), ["⏱️", "⏲️", "⏳", "⌛"]],
  [picto("ballon"), ["🤸", "🤾", "⚽", "🏃", "🚴", "🏀"]],
  [picto("loupe"), ["🔍", "🔎"]],
  [picto("rangement"), ["🗂️", "🧺", "📦"]],
  [picto("bulle"), ["🗣️", "💬"]],
  [picto("cloche"), ["🔔", "⏰"]],
  [picto("crayon"), ["✏️", "📝", "🖍️", "✍️"]],
  [picto("livre"), ["📕", "📖", "📚", "📗", "📘", "📙"]],
  [picto("oreiller"), ["😴", "💤"]],
  [moIcon("matins"), ["🌞", "☀️", "🌅", "🌄"]],
  [moIcon("couchers"), ["🌙", "🌛", "🌜"]],
  [moIcon("encourager"), ["⭐", "🌟"]],
];

/**
 * Liste de crise : des icônes lucide seulement pour les éléments (le seul Mō
 * de l'écran est à côté du titre). Les huit choix de l'app, puis ceux du site
 * et de la démo.
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
  { emoji: "💧", spec: picto("verre"), label: "Eau" },
  { emoji: "🚽", spec: picto("lavabo"), label: "Toilettes" },
  { emoji: "🚿", spec: picto("douche"), label: "Douche" },
  { emoji: "🪥", spec: picto("dents"), label: "Dents" },
  { emoji: "👕", spec: picto("habits"), label: "Habits" },
  { emoji: "🧦", spec: picto("chaussette"), label: "Chaussettes" },
  { emoji: "👟", spec: picto("chaussures"), label: "Chaussures" },
  { emoji: "🛌", spec: picto("pyjama"), label: "Pyjama" },
  { emoji: "🥣", spec: picto("bol"), label: "Petit-déj" },
  { emoji: "🍽️", spec: picto("repas"), label: "Repas" },
  { emoji: "🍪", spec: picto("gouter"), label: "Goûter" },
  { emoji: "💊", spec: picto("medicament"), label: "Médicament" },
  { emoji: "🎒", spec: picto("cartable"), label: "Cartable" },
  { emoji: "📒", spec: picto("cahier"), label: "Cahier" },
  { emoji: "📖", spec: picto("livre"), label: "Livre" },
  { emoji: "✏️", spec: picto("crayon"), label: "Écrire" },
  { emoji: "⏱️", spec: picto("sablier"), label: "Minuteur" },
  { emoji: "🔍", spec: picto("loupe"), label: "Relire" },
  { emoji: "🤸", spec: picto("ballon"), label: "Bouger" },
  { emoji: "🧺", spec: picto("rangement"), label: "Ranger" },
  { emoji: "📵", spec: picto("ecran"), label: "Écrans" },
  { emoji: "🗣️", spec: picto("bulle"), label: "Prévenir" },
  { emoji: "🔔", spec: picto("cloche"), label: "Signal" },
  { emoji: "🤍", spec: picto("calin"), label: "Câlin" },
  { emoji: "💡", spec: picto("lampe"), label: "Lumière" },
  { emoji: "😴", spec: picto("oreiller"), label: "Dormir" },
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
  const routine = kind === "routine" ? ROUTINE_LABEL.find(([, re]) => re.test(label))?.[0] : undefined;
  return routine ?? BY_LABEL.find(([, re]) => re.test(label))?.[0] ?? iconForEmoji(e);
}

/**
 * Le picto d'étape à poser au centre du cadran du minuteur, s'il y en a un.
 * Une étape du coucher (lune, « Coucher », « dodo ») montre le pyjama, comme
 * avant la suppression des emoji (#469) : le pictogramme « couchers » est un
 * paysage, pas un picto d'étape, et le cadran restait vide.
 */
export function pictoForStep(label: string, emoji?: string | null): RoutinePicto | undefined {
  const spec = iconFor({ label, emoji, kind: "step" });
  if (spec?.kind === "picto") return spec.name;
  if (spec?.kind === "mo-icon" && spec.name === "couchers") return "pyjama";
  return undefined;
}
