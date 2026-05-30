import { type ReactElement, useState } from "react";
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
import { addRecentEmoji } from "./emoji-data";
import { EmojiGrid } from "./emoji-grid";
import { CatalogPicker } from "./catalog-picker";

export { DEFAULT_EMOJIS, CRISIS_EMOJIS, ROUTINE_STEP_EMOJIS } from "./emoji-picker-data";

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
