import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  EMOJI_CATALOG,
  EMOJI_LABELS,
  addRecentEmoji,
  getRecentEmojis,
} from "./emoji-data";
import { EmojiButton } from "./emoji-button";

export function CatalogPicker({
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
    const resultSet = new Set<string>();
    for (const [emoji, labels] of Object.entries(EMOJI_LABELS)) {
      if (labels.toLowerCase().includes(query)) {
        resultSet.add(emoji);
      }
    }
    for (const cat of EMOJI_CATALOG) {
      for (const emoji of cat.emojis) {
        if (String(emoji).includes(query)) {
          resultSet.add(emoji);
        }
      }
    }
    return Array.from(resultSet);
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
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
        {emojis.map((emoji) => (
          <EmojiButton
            key={`${keyPrefix}-${emoji}`}
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
            <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
              {filteredEmojis.map((emoji) => (
                <EmojiButton
                  key={`search-${emoji}`}
                  emoji={emoji}
                  selected={value === emoji}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )
        ) : currentCategory ? (
          <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
            {currentCategory.emojis.map((emoji) => (
              <EmojiButton
                key={`cat-${emoji}`}
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
