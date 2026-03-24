import type { ReactElement } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const DEFAULT_EMOJIS = [
  "🎁", "🎮", "🎨", "🍦", "🍕", "🍿", "🎬", "🎪",
  "🎠", "🏊", "⚽", "🚴", "🛝", "🎯", "🧩", "🎲",
  "📖", "🖍️", "🎵", "🎤", "🛍️", "👑", "🌟", "🏆",
  "🧸", "🎈", "🎉", "🍫", "🍰", "🍪", "🧁", "🥤",
  "📺", "🎧", "💤", "🛁", "🐾", "🌳", "🚀", "✨",
];

export const CRISIS_EMOJIS = [
  "🧸", "🎵", "📺", "🫧", "🖍️",
  "🤗", "📖", "🧘", "🏃", "🛁",
  "🎮", "🐾", "🧩", "🎨", "🌳",
  "💤", "🎧", "🫂", "⚽", "🍫",
  "💙", "⭐", "🌈", "🎪", "😊",
];

const GRID_COLS: Record<number, string> = {
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
};

export function EmojiPicker({
  value,
  onSelect,
  emojis = DEFAULT_EMOJIS,
  placeholder = "🎁",
  columns = 8,
  children,
}: {
  value: string;
  onSelect: (emoji: string) => void;
  emojis?: string[];
  placeholder?: string;
  columns?: number;
  children?: ReactElement;
}) {
  return (
    <Popover>
      {children ? (
        <PopoverTrigger render={children} />
      ) : (
        <PopoverTrigger className="flex h-9 w-14 flex-none cursor-pointer items-center justify-center rounded-l-md border border-r-0 bg-background text-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {value || <span className="opacity-50">{placeholder}</span>}
        </PopoverTrigger>
      )}
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-auto p-2"
      >
        <div className={`grid gap-1 ${GRID_COLS[columns] ?? "grid-cols-8"}`}>
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent ${
                value === emoji ? "bg-accent ring-2 ring-primary" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
