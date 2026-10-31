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
import { ItemIcon } from "@/components/shared/item-icon";
import {
  ITEM_ICON_KEYS,
  itemIconKeyFor,
  storedValueForIcon,
  type ItemIconKey,
} from "@/lib/item-icons";

export { CRISIS_ICON_KEYS, ROUTINE_STEP_ICON_KEYS } from "./icon-picker-data";

const GRID_COLS: Record<number, string> = {
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-6 sm:grid-cols-7",
  8: "grid-cols-6 sm:grid-cols-8",
};

function IconGrid({
  keys,
  value,
  onSelect,
  columns,
}: {
  keys: readonly ItemIconKey[];
  value: string;
  onSelect: (key: ItemIconKey) => void;
  columns: number;
}) {
  const { t } = useTranslation();
  const selectedKey = itemIconKeyFor(value);
  return (
    <div className={`grid gap-1 ${GRID_COLS[columns] ?? GRID_COLS[8]}`}>
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          aria-label={t(`itemIcons.${key}`)}
          title={t(`itemIcons.${key}`)}
          aria-pressed={selectedKey === key}
          className={`flex h-11 w-full min-w-9 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            selectedKey === key ? "bg-accent ring-2 ring-primary" : ""
          }`}
        >
          <ItemIcon value={key} className="size-5" />
        </button>
      ))}
    </div>
  );
}

export function IconPickerValue({
  value,
  placeholder = "smile",
  className = "size-5",
}: {
  value: string | null | undefined;
  placeholder?: ItemIconKey;
  className?: string;
}) {
  return value ? (
    <ItemIcon value={value} className={className} />
  ) : (
    <ItemIcon value={placeholder} className={`${className} opacity-40`} />
  );
}

export function IconPicker({
  value,
  onSelect,
  keys = ITEM_ICON_KEYS,
  placeholder,
  columns = 8,
  children,
}: {
  value: string;
  onSelect: (stored: string) => void;
  keys?: readonly ItemIconKey[];
  placeholder?: ItemIconKey;
  columns?: number;
  children?: ReactElement;
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleSelect = (key: ItemIconKey) => {
    onSelect(storedValueForIcon(key));
    setOpen(false);
  };

  const defaultTrigger = (
    <button
      type="button"
      aria-label={t("iconPicker.title")}
      className="flex h-9 w-14 flex-none cursor-pointer items-center justify-center rounded-l-md border border-r-0 bg-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <IconPickerValue value={value} placeholder={placeholder} />
    </button>
  );

  const triggerElement = children ?? defaultTrigger;

  const content = (
    <IconGrid keys={keys} value={value} onSelect={handleSelect} columns={columns} />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={triggerElement} />
        <SheetContent
          side="bottom"
          className="flex max-h-[80dvh] flex-col gap-0 p-0"
        >
          <SheetHeader className="shrink-0 border-b">
            <SheetTitle>{t("iconPicker.title")}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">{content}</div>
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
        className="max-h-[70dvh] w-auto overflow-y-auto p-2"
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
