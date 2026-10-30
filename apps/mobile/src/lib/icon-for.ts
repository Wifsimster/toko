import type { PictoName } from "@focusflow/mo/child";
import {
  CRISIS_ICON_CHOICES,
  CRISIS_ICON_FALLBACK,
  crisisIconNameFor,
  normalizeEmoji,
  type CrisisIconName,
} from "@focusflow/mo/crisis-icons";
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

export type RoutinePicto = Exclude<PictoName, "oeuf-0" | "oeuf-1" | "oeuf-2" | "oeuf-3" | "oeuf-ouvert">;

export type MoIconName = "matins" | "couchers" | "encourager";

export type MoSpec = { kind: "picto"; name: RoutinePicto } | { kind: "mo-icon"; name: MoIconName };

export type IconSpec = MoSpec | { kind: "lucide"; icon: LucideIcon };

export type IconKind = "routine" | "step" | "reward" | "behavior" | "crisis";

const picto = (name: RoutinePicto): MoSpec => ({ kind: "picto", name });
const moIcon = (name: MoIconName): MoSpec => ({ kind: "mo-icon", name });

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

const ROUTINE_LABEL: ReadonlyArray<readonly [MoSpec, RegExp]> = [
  [moIcon("couchers"), /\bdormir\b|\bdodo\b/i],
];

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

const CRISIS_ICONS: Record<CrisisIconName, LucideIcon> = {
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
};

export const CRISIS_CHOICES: ReadonlyArray<{ emoji: string; icon: LucideIcon; label: string }> =
  CRISIS_ICON_CHOICES.map((c) => ({ emoji: c.emoji, icon: CRISIS_ICONS[c.icon], label: c.label }));

export const CRISIS_FALLBACK: LucideIcon = CRISIS_ICONS[CRISIS_ICON_FALLBACK];

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

export { normalizeEmoji };

function findByEmoji<T>(table: ReadonlyArray<readonly [T, readonly string[]]>, emoji: string): T | undefined {
  if (!emoji) return undefined;
  return table.find(([, list]) => list.some((e) => normalizeEmoji(e) === emoji))?.[0];
}

export function iconForEmoji(emoji: string | null | undefined): MoSpec | undefined {
  return findByEmoji(BY_EMOJI, normalizeEmoji(emoji));
}

export function iconFor(input: { label: string; emoji?: string | null; kind: "crisis" }): IconSpec;
export function iconFor(input: { label: string; emoji?: string | null; kind: Exclude<IconKind, "crisis"> }): MoSpec | undefined;
export function iconFor({ label, emoji, kind }: { label: string; emoji?: string | null; kind: IconKind }): IconSpec | undefined {
  const e = normalizeEmoji(emoji);
  if (kind === "crisis") {
    return { kind: "lucide", icon: CRISIS_ICONS[crisisIconNameFor(e)] };
  }
  const routine = kind === "routine" ? ROUTINE_LABEL.find(([, re]) => re.test(label))?.[0] : undefined;
  return routine ?? BY_LABEL.find(([, re]) => re.test(label))?.[0] ?? iconForEmoji(e);
}

export function pictoForStep(label: string, emoji?: string | null): RoutinePicto | undefined {
  const spec = iconFor({ label, emoji, kind: "step" });
  if (spec?.kind === "picto") return spec.name;
  if (spec?.kind === "mo-icon" && spec.name === "couchers") return "pyjama";
  return undefined;
}
