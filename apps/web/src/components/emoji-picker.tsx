import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DEFAULT_EMOJIS = [
  "🎁", "🎮", "🎨", "🍦", "🍕", "🍿", "🎬", "🎪",
  "🎠", "🏊", "⚽", "🚴", "🛝", "🎯", "🧩", "🎲",
  "📖", "🖍️", "🎵", "🎤", "🛍️", "👑", "🌟", "🏆",
  "🧸", "🎈", "🎉", "🍫", "🍰", "🍪", "🧁", "🥤",
  "📺", "🎧", "💤", "🛁", "🐾", "🌳", "🚀", "✨",
];

export function EmojiPicker({
  value,
  onSelect,
  emojis = DEFAULT_EMOJIS,
  placeholder = "🎁",
}: {
  value: string;
  onSelect: (emoji: string) => void;
  emojis?: string[];
  placeholder?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className="flex h-9 w-14 flex-none cursor-pointer items-center justify-center rounded-l-md border border-r-0 bg-background text-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {value || <span className="opacity-50">{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-auto p-2"
      >
        <div className="grid grid-cols-8 gap-1">
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
