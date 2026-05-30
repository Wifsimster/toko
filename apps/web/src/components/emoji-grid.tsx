import { EmojiButton } from "./emoji-button";

const GRID_COLS: Record<number, string> = {
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
};

export function EmojiGrid({
  emojis,
  value,
  onSelect,
  columns,
}: {
  emojis: string[];
  value: string;
  onSelect: (emoji: string) => void;
  columns: number;
}) {
  return (
    <div className={`grid gap-1 ${GRID_COLS[columns] ?? "grid-cols-8"}`}>
      {emojis.map((emoji) => (
        <EmojiButton
          key={emoji}
          emoji={emoji}
          selected={value === emoji}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
