import { type ReactElement, useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const ITEMS_PER_PAGE = 40;

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
        <button
          key={`${emoji}-${i}`}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`flex h-9 w-9 items-center justify-center rounded-md text-lg transition-all hover:bg-accent hover:scale-110 ${
            value === emoji ? "bg-accent ring-2 ring-primary" : ""
          }`}
        >
          {emoji}
        </button>
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
  const [page, setPage] = useState(0);
  const deferredSearch = useDeferredValue(search);
  const [recents, setRecents] = useState(getRecentEmojis);

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

  const displayEmojis = filteredEmojis
    ? filteredEmojis
    : currentCategory
      ? currentCategory.emojis
      : EMOJI_CATALOG.flatMap((c) => c.emojis);

  const totalPages = Math.ceil(displayEmojis.length / ITEMS_PER_PAGE);
  const pagedEmojis = displayEmojis.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  const handleCategoryChange = (catId: string | null) => {
    setActiveCategory(catId);
    setPage(0);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  const handleSelect = (emoji: string) => {
    addRecentEmoji(emoji);
    setRecents(getRecentEmojis());
    onSelect(emoji);
  };

  return (
    <div className="flex w-72 flex-col gap-2">
      {/* Recherche */}
      <input
        type="text"
        placeholder={t("emojiPicker.searchPlaceholder")}
        aria-label={t("emojiPicker.searchLabel")}
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Onglets catégories */}
      {!filteredEmojis && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => handleCategoryChange(null)}
            className={`flex-none rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            Tous
          </button>
          {EMOJI_CATALOG.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex flex-none items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
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

      {/* Récents */}
      {!filteredEmojis && !activeCategory && recents.length > 0 && page === 0 && (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            {t("emojiPicker.recent")}
          </p>
          <div className="grid grid-cols-8 gap-1">
            {recents.map((emoji, i) => (
              <button
                key={`recent-${emoji}-${i}`}
                type="button"
                onClick={() => handleSelect(emoji)}
                className={`flex h-9 w-9 items-center justify-center rounded-md text-lg transition-all hover:bg-accent hover:scale-110 ${
                  value === emoji ? "bg-accent ring-2 ring-primary" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="my-1 border-b" />
        </div>
      )}

      {/* Grille d'emojis */}
      <div className="max-h-64 overflow-y-auto">
        {filteredEmojis && filteredEmojis.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("emojiPicker.noResults")}
          </p>
        ) : (
          <EmojiGrid
            emojis={pagedEmojis}
            value={value}
            onSelect={handleSelect}
            columns={8}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-1">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md px-2 py-0.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Préc.
          </button>
          <span className="text-xs text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md px-2 py-0.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
          >
            Suiv. →
          </button>
        </div>
      )}
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
  const isFlatMode = emojis !== undefined;

  const handleSelect = (emoji: string) => {
    if (!isFlatMode) {
      addRecentEmoji(emoji);
    }
    onSelect(emoji);
  };

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
        {isFlatMode ? (
          <EmojiGrid
            emojis={emojis}
            value={value}
            onSelect={handleSelect}
            columns={columns}
          />
        ) : (
          <CatalogPicker value={value} onSelect={onSelect} />
        )}
      </PopoverContent>
    </Popover>
  );
}
