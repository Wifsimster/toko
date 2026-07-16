import { EMOJI_LABELS } from "./emoji-data";

function ariaLabelFor(emoji: string): string {
  return EMOJI_LABELS[emoji] ?? emoji;
}

export function EmojiButton({
  emoji,
  selected,
  onSelect,
}: {
  emoji: string;
  selected: boolean;
  onSelect: (emoji: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(emoji)}
      aria-label={ariaLabelFor(emoji)}
      aria-pressed={selected}
      className={`flex h-11 w-full min-w-9 items-center justify-center rounded-md text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? "bg-accent ring-2 ring-primary" : ""
      }`}
    >
      {emoji}
    </button>
  );
}
