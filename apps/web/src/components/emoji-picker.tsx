import {
  type ReactElement,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  EMOJI_CATALOG,
  EMOJI_LABELS,
  addRecentEmoji,
  getRecentEmojis,
} from "./emoji-data";

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

function ariaLabelFor(emoji: string): string {
  return EMOJI_LABELS[emoji] ?? emoji;
}

function EmojiButton({
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
      className={`flex h-11 w-11 items-center justify-center rounded-md text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? "bg-accent ring-2 ring-primary" : ""
      }`}
    >
      {emoji}
    </button>
  );
}

function EmojiGrid({
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
      {emojis.map((emoji, i) => (
        <EmojiButton
          key={`${emoji}-${i}`}
          emoji={emoji}
          selected={value === emoji}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function CatalogPicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (emoji: string) => void;
}) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [recents, setRecents] = useState(getRecentEmojis);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredEmojis = useMemo(() => {
    if (!deferredSearch.trim()) return null;
    const query = deferredSearch.toLowerCase().trim();
    const results: string[] = [];
    for (const [emoji, labels] of Object.entries(EMOJI_LABELS)) {
      if (labels.toLowerCase().includes(query)) {
        results.push(emoji);
      }
    }
    for (const cat of EMOJI_CATALOG) {
      for (const emoji of cat.emojis) {
        if (emoji.includes(query) && !results.includes(emoji)) {
          results.push(emoji);
        }
      }
    }
    return results;
  }, [deferredSearch]);

  const currentCategory = activeCategory
    ? EMOJI_CATALOG.find((c) => c.id === activeCategory)
    : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeCategory, deferredSearch]);

  const handleSelect = (emoji: string) => {
    addRecentEmoji(emoji);
    setRecents(getRecentEmojis());
    onSelect(emoji);
  };

  const renderCategorySection = (
    label: string,
    emojis: string[],
    keyPrefix: string,
  ) => (
    <div key={keyPrefix}>
      <p className="sticky top-0 z-10 bg-popover/95 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
        {label}
      </p>
      <div className="grid grid-cols-7 gap-1 sm:grid-cols-8">
        {emojis.map((emoji, i) => (
          <EmojiButton
            key={`${keyPrefix}-${emoji}-${i}`}
            emoji={emoji}
            selected={value === emoji}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <input
        type="search"
        placeholder={t("emojiPicker.searchPlaceholder")}
        aria-label={t("emojiPicker.searchLabel")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />

      {!filteredEmojis && (
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`flex-none rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            {t("emojiPicker.allCategories")}
          </button>
          {EMOJI_CATALOG.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              aria-label={cat.label}
              className={`flex flex-none items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
              title={cat.label}
            >
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
      >
        {filteredEmojis ? (
          filteredEmojis.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("emojiPicker.noResults")}
            </p>
          ) : (
            <div className="grid grid-cols-7 gap-1 sm:grid-cols-8">
              {filteredEmojis.map((emoji, i) => (
                <EmojiButton
                  key={`search-${emoji}-${i}`}
                  emoji={emoji}
                  selected={value === emoji}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )
        ) : currentCategory ? (
          <div className="grid grid-cols-7 gap-1 sm:grid-cols-8">
            {currentCategory.emojis.map((emoji, i) => (
              <EmojiButton
                key={`cat-${emoji}-${i}`}
                emoji={emoji}
                selected={value === emoji}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recents.length > 0 &&
              renderCategorySection(t("emojiPicker.recent"), recents, "recent")}
            {EMOJI_CATALOG.map((cat) =>
              renderCategorySection(cat.label, cat.emojis, cat.id),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmojiPicker({
  value,
  onSelect,
  emojis,
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
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const isFlatMode = emojis !== undefined;

  const handleSelect = (emoji: string) => {
    if (!isFlatMode) {
      addRecentEmoji(emoji);
    }
    onSelect(emoji);
    setOpen(false);
  };

  const defaultTrigger = (
    <button
      type="button"
      aria-label={t("emojiPicker.title")}
      className="flex h-9 w-14 flex-none cursor-pointer items-center justify-center rounded-l-md border border-r-0 bg-background text-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {value || <span className="opacity-50">{placeholder}</span>}
    </button>
  );

  const triggerElement = children ?? defaultTrigger;

  const content = isFlatMode ? (
    <EmojiGrid
      emojis={emojis}
      value={value}
      onSelect={handleSelect}
      columns={columns}
    />
  ) : (
    <CatalogPicker value={value} onSelect={handleSelect} />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={triggerElement} />
        <SheetContent
          side="bottom"
          className="flex h-[80dvh] flex-col gap-0 p-0"
        >
          <SheetHeader className="shrink-0 border-b">
            <SheetTitle>{t("emojiPicker.title")}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0 p-3">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={triggerElement} />
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className={
          isFlatMode
            ? "w-auto p-2"
            : "flex h-[28rem] w-[min(24rem,calc(100vw-2rem))] max-h-[70dvh] flex-col overflow-hidden p-3"
        }
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
