import {
  ITEM_ICON_KEYS,
  ITEM_ICON_STORED,
  itemIconKeyFor,
  normalizeIconValue,
  type ItemIconKey,
} from "@focusflow/mo/item-icons";
import {
  CRISIS_ICON_CHOICES,
  CRISIS_ICON_FALLBACK,
  crisisIconNameFor,
  normalizeEmoji,
  type CrisisIconName,
} from "@focusflow/mo/crisis-icons";
import { moSpecFor, moSpecForEmoji, type MoIconName, type MoSpec, type RoutinePicto } from "@focusflow/mo/step-icons";
import { itemIconLabels } from "./copy";
import { ITEM_ICON_COMPONENTS } from "./item-icon-components";
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
  Rabbit,
  Rainbow,
  Smile,
  Sparkles,
  Star,
  Tent,
  TreeDeciduous,
  Tv,
  Volleyball,
  Wind,
  type LucideIcon,
} from "lucide-react-native";

const picto = (name: RoutinePicto): MoSpec => ({ kind: "picto", name });
const moIcon = (name: MoIconName): MoSpec => ({ kind: "mo-icon", name });

export type { MoIconName, MoSpec, RoutinePicto };

export type IconSpec = MoSpec | { kind: "lucide"; icon: LucideIcon };

export type IconKind = "routine" | "step" | "reward" | "behavior" | "crisis";


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
  Rabbit,
  Rainbow,
  Smile,
  Sparkles,
  Star,
  Tent,
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

export type IconChoice = { emoji: string; spec: IconSpec; label: string };

const MO_CHOICE_EMOJIS = new Set(ICON_CHOICES.map((c) => normalizeIconValue(c.emoji)));

const visualId = (spec: IconSpec): string => (spec.kind === "lucide" ? spec.icon.displayName ?? String(spec.icon) : `${spec.kind}:${spec.name}`);

const SHARED_CHOICES: ReadonlyArray<IconChoice> = (() => {
  const seen = new Set(ICON_CHOICES.map((c) => visualId(c.spec)));
  const out: IconChoice[] = [];
  for (const key of ITEM_ICON_KEYS) {
    if (MO_CHOICE_EMOJIS.has(normalizeIconValue(ITEM_ICON_STORED[key]))) continue;
    const spec = iconFor({ label: "", emoji: ITEM_ICON_STORED[key], kind: "step" });
    if (!spec) continue;
    const id = visualId(spec);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ emoji: ITEM_ICON_STORED[key], spec, label: itemIconLabels[key] });
  }
  return out;
})();

export const PICKER_CHOICES: ReadonlyArray<IconChoice> = [...ICON_CHOICES, ...SHARED_CHOICES];

export function sharedIconFor(emoji: string | null | undefined): IconSpec | undefined {
  const key: ItemIconKey | null = itemIconKeyFor(emoji);
  return key ? { kind: "lucide", icon: ITEM_ICON_COMPONENTS[key] } : undefined;
}

export function iconForEmoji(emoji: string | null | undefined): MoSpec | undefined {
  return moSpecForEmoji(emoji);
}

export function iconFor(input: { label: string; emoji?: string | null; kind: "crisis" }): IconSpec;
export function iconFor(input: { label: string; emoji?: string | null; kind: Exclude<IconKind, "crisis"> }): IconSpec | undefined;
export function iconFor({ label, emoji, kind }: { label: string; emoji?: string | null; kind: IconKind }): IconSpec | undefined {
  const e = normalizeEmoji(emoji);
  if (kind === "crisis") {
    return { kind: "lucide", icon: CRISIS_ICONS[crisisIconNameFor(e)] };
  }
  const mo = moSpecFor({ label, emoji: e, kind });
  const shared = sharedIconFor(e);
  return mo ?? shared;
}

export function pictoForStep(label: string, emoji?: string | null): RoutinePicto | undefined {
  const spec = iconFor({ label, emoji, kind: "step" });
  if (spec?.kind === "picto") return spec.name;
  if (spec?.kind === "mo-icon" && spec.name === "couchers") return "pyjama";
  return undefined;
}
