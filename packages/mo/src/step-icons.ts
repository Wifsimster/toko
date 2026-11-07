import type { CompanionId, PictoName } from "./types";
import { crisisIconNameFor, normalizeEmoji, type CrisisIconName } from "./crisis-icons";
import { itemIconKeyFor, type ItemIconKey } from "./item-icons";

export type RoutinePicto = Exclude<PictoName, "oeuf-0" | "oeuf-1" | "oeuf-2" | "oeuf-3" | "oeuf-ouvert">;

export type MoIconName = "matins" | "couchers" | "encourager";

export type MoSpec =
  | { kind: "picto"; name: RoutinePicto }
  | { kind: "mo-icon"; name: MoIconName }
  | { kind: "companion"; name: CompanionId };

export type MoIconKind = "routine" | "step" | "reward" | "behavior" | "crisis";

const picto = (name: RoutinePicto): MoSpec => ({ kind: "picto", name });
const moIcon = (name: MoIconName): MoSpec => ({ kind: "mo-icon", name });
const companion = (name: CompanionId): MoSpec => ({ kind: "companion", name });

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
  [picto("ballon"), /pause|bouger|d[ée]foul|\bsport|jouer dehors|courir|sauter|\bballon|[ée]tirement/i],
  [picto("loupe"), /relecture|\brelire|v[ée]rifier|loupe/i],
  [picto("rangement"), /\brang(er|e|ement)\b/i],
  [picto("bulle"), /annonce|pr[ée]venir|\bavertir|\brappel/i],
  [picto("cloche"), /signal|cloche|sonnerie|\bgong\b/i],
  [picto("crayon"), /[ée]crire|dessin|colori|crayon/i],
  [picto("livre"), /\blivre|lecture|\blire\b|histoire|devoirs?\b/i],
  [picto("oreiller"), /\bdormir\b|\bdodo\b|sieste|oreiller|\bdors\b/i],
  [moIcon("matins"), /\bmatin/i],
  [moIcon("couchers"), /coucher|\bnuit\b/i],
  [picto("lit"), /\b(fai[st]|faire|mon|ton|son|le) lit\b/i],
  [picto("gateau"), /g[aâ]teau|p[aâ]tisserie/i],
  [picto("glace"), /\bglaces?\b/i],
  [picto("pizza"), /pizza/i],
  [picto("popcorn"), /pop-?corn/i],
  [picto("bonbon"), /bonbon|friandise|chocolat/i],
  [picto("cadeau"), /cadeau|surprise/i],
  [picto("cinema"), /cin[ée]ma|\bfilm\b/i],
  [picto("manette"), /jeu vid[ée]o|console|manette/i],
  [picto("puzzle"), /puzzle/i],
  [picto("palette"), /peinture|peindre|bricolage/i],
  [picto("musique"), /musique|chanson|chanter/i],
  [picto("bouee"), /piscine|nager|natation/i],
  [picto("velo"), /\bv[ée]lo\b|trottinette/i],
  [picto("maison"), /maison/i],
  [picto("ecole"), /[ée]cole|classe/i],
  [picto("voiture"), /voiture/i],
  [picto("arbre"), /\bparc\b|for[eê]t|balade|promenade/i],
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
  [picto("gouter"), ["🍪", "🍌", "🧁"]],
  [picto("repas"), ["🍽️", "🍴", "🥗", "🍝"]],
  [picto("medicament"), ["💊", "🩹"]],
  [picto("calin"), ["🤍", "❤️", "💗", "💕", "🤗", "🫂", "🫶"]],
  [picto("lampe"), ["💡", "🕯️"]],
  [picto("ecran"), ["📵", "📱", "📺"]],
  [picto("cahier"), ["📒", "📓", "📔"]],
  [picto("sablier"), ["⏱️", "⏲️", "⏳", "⌛"]],
  [picto("ballon"), ["🤸", "🤾", "⚽", "🏃", "🏀"]],
  [picto("loupe"), ["🔍", "🔎"]],
  [picto("rangement"), ["🗂️", "🧺", "📦"]],
  [picto("bulle"), ["🗣️", "💬"]],
  [picto("cloche"), ["🔔"]],
  [picto("crayon"), ["✏️", "📝", "🖍️", "✍️"]],
  [picto("livre"), ["📕", "📖", "📚", "📗", "📘", "📙"]],
  [picto("oreiller"), ["😴", "💤"]],
  [moIcon("matins"), ["🌞", "☀️", "🌅", "🌄"]],
  [moIcon("couchers"), ["🌙", "🌛", "🌜"]],
  [moIcon("encourager"), ["⭐", "🌟"]],
];

export const ITEM_ICON_SPECS: Record<ItemIconKey, MoSpec> = {
  heart: picto("calin"),
  smile: picto("sourire"),
  laugh: picto("rire"),
  frown: picto("triste"),
  meh: picto("bof"),
  sparkles: moIcon("encourager"),
  star: moIcon("encourager"),
  sun: moIcon("matins"),
  moon: moIcon("couchers"),
  bed: picto("lit"),
  bath: picto("douche"),
  shower: picto("douche"),
  teeth: picto("dents"),
  droplets: picto("verre"),
  milk: picto("verre"),
  shirt: picto("habits"),
  backpack: picto("cartable"),
  meal: picto("repas"),
  cookie: picto("gouter"),
  fruit: picto("pomme"),
  pizza: picto("pizza"),
  icecream: picto("glace"),
  cake: picto("gateau"),
  candy: picto("bonbon"),
  popcorn: picto("popcorn"),
  pill: picto("medicament"),
  book: picto("livre"),
  notebook: picto("cahier"),
  pencil: picto("crayon"),
  palette: picto("palette"),
  puzzle: picto("puzzle"),
  gamepad: picto("manette"),
  music: picto("musique"),
  mic: picto("micro"),
  headphones: picto("casque"),
  tv: picto("ecran"),
  movie: picto("cinema"),
  phoneoff: picto("ecran"),
  clock: picto("sablier"),
  alarm: picto("reveil"),
  bell: picto("cloche"),
  talk: picto("bulle"),
  quiet: picto("chut"),
  listen: picto("oreille"),
  laundry: picto("rangement"),
  tidy: picto("rangement"),
  run: picto("ballon"),
  bike: picto("velo"),
  strong: picto("haltere"),
  ball: picto("ballon"),
  swim: picto("bouee"),
  tree: picto("arbre"),
  tent: picto("tente"),
  rainbow: picto("arcenciel"),
  party: picto("fete"),
  gift: picto("cadeau"),
  trophy: picto("trophee"),
  crown: picto("couronne"),
  shopping: picto("sac"),
  outing: picto("ticket"),
  hug: picto("calin"),
  comfort: picto("calin"),
  together: picto("famille"),
  hand: picto("main"),
  thumbs: picto("pouce"),
  done: picto("coche"),
  breathe: picto("souffle"),
  pet: picto("patte"),
  dog: companion("dog"),
  cat: companion("cat"),
  teddy: companion("bear"),
  bird: companion("chick"),
  fish: picto("poisson"),
  turtle: companion("turtle"),
  family: picto("famille"),
  baby: picto("biberon"),
  school: picto("ecole"),
  home: picto("maison"),
  car: picto("voiture"),
  rocket: picto("fusee"),
  idea: picto("lampe"),
  target: picto("cible"),
  camera: picto("photo"),
  fire: picto("feu"),
};

export const CRISIS_ICON_SPECS: Record<CrisisIconName, MoSpec> = {
  Bath: picto("douche"),
  BookOpen: picto("livre"),
  Candy: picto("bonbon"),
  Footprints: picto("chaussures"),
  Gamepad2: picto("manette"),
  HandHeart: picto("calin"),
  Headphones: picto("casque"),
  Heart: picto("calin"),
  HeartHandshake: picto("calin"),
  Moon: moIcon("couchers"),
  Music: picto("musique"),
  Palette: picto("palette"),
  PawPrint: picto("patte"),
  Pencil: picto("crayon"),
  Puzzle: picto("puzzle"),
  Rabbit: companion("rabbit"),
  Rainbow: picto("arcenciel"),
  Smile: picto("sourire"),
  Sparkles: moIcon("encourager"),
  Star: moIcon("encourager"),
  Tent: picto("tente"),
  TreeDeciduous: picto("arbre"),
  Tv: picto("ecran"),
  Volleyball: picto("ballon"),
  Wind: picto("souffle"),
};

export const MO_SPEC_FALLBACK: MoSpec = picto("calin");

export function moSpecForEmoji(emoji: string | null | undefined): MoSpec | undefined {
  const e = normalizeEmoji(emoji);
  if (!e) return undefined;
  const direct = BY_EMOJI.find(([, list]) => list.some((x) => normalizeEmoji(x) === e))?.[0];
  if (direct) return direct;
  const key = itemIconKeyFor(e);
  return key ? ITEM_ICON_SPECS[key] : undefined;
}

export function moSpecForCrisis(emoji: string | null | undefined): MoSpec {
  return moSpecForEmoji(emoji) ?? CRISIS_ICON_SPECS[crisisIconNameFor(emoji)];
}

export function moSpecForItem({ label, emoji, kind }: { label: string; emoji?: string | null; kind: MoIconKind }): MoSpec {
  return moSpecFor({ label, emoji, kind }) ?? (emoji ? moSpecForCrisis(emoji) : MO_SPEC_FALLBACK);
}

export function moSpecFor({ label, emoji, kind }: { label: string; emoji?: string | null; kind: MoIconKind }): MoSpec | undefined {
  const routine = kind === "routine" ? ROUTINE_LABEL.find(([, re]) => re.test(label))?.[0] : undefined;
  return routine ?? BY_LABEL.find(([, re]) => re.test(label))?.[0] ?? moSpecForEmoji(emoji);
}
