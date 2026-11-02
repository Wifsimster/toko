import type { PictoName } from "./types";
import { normalizeEmoji } from "./crisis-icons";

export type RoutinePicto = Exclude<PictoName, "oeuf-0" | "oeuf-1" | "oeuf-2" | "oeuf-3" | "oeuf-ouvert">;

export type MoIconName = "matins" | "couchers" | "encourager";

export type MoSpec = { kind: "picto"; name: RoutinePicto } | { kind: "mo-icon"; name: MoIconName };

export type MoIconKind = "routine" | "step" | "reward" | "behavior" | "crisis";

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

export function moSpecForEmoji(emoji: string | null | undefined): MoSpec | undefined {
  const e = normalizeEmoji(emoji);
  if (!e) return undefined;
  return BY_EMOJI.find(([, list]) => list.some((x) => normalizeEmoji(x) === e))?.[0];
}

export function moSpecFor({ label, emoji, kind }: { label: string; emoji?: string | null; kind: MoIconKind }): MoSpec | undefined {
  const routine = kind === "routine" ? ROUTINE_LABEL.find(([, re]) => re.test(label))?.[0] : undefined;
  return routine ?? BY_LABEL.find(([, re]) => re.test(label))?.[0] ?? moSpecForEmoji(emoji);
}
