export type CrisisIconName =
  | "Bath"
  | "BookOpen"
  | "Candy"
  | "Footprints"
  | "Gamepad2"
  | "HandHeart"
  | "Headphones"
  | "Heart"
  | "HeartHandshake"
  | "Moon"
  | "Music"
  | "Palette"
  | "PawPrint"
  | "Pencil"
  | "Puzzle"
  | "Rainbow"
  | "Smile"
  | "Sparkles"
  | "Star"
  | "Tent"
  | "ToyBrick"
  | "TreeDeciduous"
  | "Tv"
  | "Volleyball"
  | "Wind";

export const CRISIS_ICON_CHOICES: ReadonlyArray<{ emoji: string; icon: CrisisIconName; label: string }> = [
  { emoji: "💙", icon: "Heart", label: "Cœur" },
  { emoji: "🧸", icon: "ToyBrick", label: "Jouet" },
  { emoji: "🎵", icon: "Music", label: "Musique" },
  { emoji: "📖", icon: "BookOpen", label: "Livre" },
  { emoji: "🧘", icon: "Wind", label: "Respirer" },
  { emoji: "🤗", icon: "HeartHandshake", label: "Câlin" },
  { emoji: "🛁", icon: "Bath", label: "Bain" },
  { emoji: "🐾", icon: "PawPrint", label: "Animal" },
];

export const CRISIS_ICON_EXTRA: ReadonlyArray<readonly [CrisisIconName, readonly string[]]> = [
  ["BookOpen", ["📚"]],
  ["Tv", ["📺"]],
  ["Sparkles", ["🫧", "✨", "🎪"]],
  ["Pencil", ["🖍️", "✏️"]],
  ["Footprints", ["🏃"]],
  ["Gamepad2", ["🎮"]],
  ["Puzzle", ["🧩"]],
  ["Palette", ["🎨"]],
  ["TreeDeciduous", ["🌳"]],
  ["Moon", ["💤", "😴", "🌙"]],
  ["Headphones", ["🎧"]],
  ["HandHeart", ["🫂"]],
  ["Volleyball", ["⚽"]],
  ["Candy", ["🍫"]],
  ["Star", ["⭐", "🌟"]],
  ["Rainbow", ["🌈"]],
  ["Tent", ["⛺"]],
  ["Smile", ["😊", "🙂"]],
];

export const CRISIS_ICON_FALLBACK: CrisisIconName = "Heart";

export function normalizeEmoji(emoji: string | null | undefined): string {
  return (emoji ?? "").replace(/️/g, "").trim();
}

export function crisisIconNameFor(emoji: string | null | undefined): CrisisIconName {
  const e = normalizeEmoji(emoji);
  if (!e) return CRISIS_ICON_FALLBACK;
  const choice = CRISIS_ICON_CHOICES.find((c) => normalizeEmoji(c.emoji) === e);
  if (choice) return choice.icon;
  const extra = CRISIS_ICON_EXTRA.find(([, list]) => list.some((x) => normalizeEmoji(x) === e));
  return extra?.[0] ?? CRISIS_ICON_FALLBACK;
}
