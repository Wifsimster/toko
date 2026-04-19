import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { navItems } from "@/config/nav";
import { useChildren } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";
import { getChildEmoji } from "@/lib/utils";

export function useCommandPaletteShortcut(open: boolean, setOpen: (v: boolean) => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: children } = useChildren();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const setActiveChild = useUiStore((s) => s.setActiveChild);

  const runCommand = useCallback(
    (cb: () => void) => {
      onOpenChange(false);
      cb();
    },
    [onOpenChange]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("commandPalette.title")}
      description={t("commandPalette.description")}
    >
      <CommandInput placeholder={t("commandPalette.placeholder")} />
      <CommandList>
        <CommandEmpty>{t("commandPalette.empty")}</CommandEmpty>

        <CommandGroup heading={t("commandPalette.navigation")}>
          {navItems.map((item) => (
            <CommandItem
              key={item.to}
              value={`${t(item.labelKey)} ${item.to}`}
              onSelect={() =>
                runCommand(() => navigate({ to: item.to }))
              }
            >
              <item.icon />
              <span>{t(item.labelKey)}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {children && children.length > 1 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("commandPalette.switchChild")}>
              {children.map((child) => {
                const isActive = child.id === activeChildId;
                return (
                  <CommandItem
                    key={child.id}
                    value={`${t("commandPalette.switchTo")} ${child.name}`}
                    onSelect={() =>
                      runCommand(() => setActiveChild(child.id))
                    }
                    data-checked={isActive ? "true" : undefined}
                  >
                    <span className="text-base leading-none">
                      {getChildEmoji(child.gender)}
                    </span>
                    <span>{child.name}</span>
                    {isActive && (
                      <CommandShortcut>
                        {t("commandPalette.active")}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function CommandPaletteTrigger({
  onOpen,
  className,
}: {
  onOpen: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
    }
  }, []);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t("commandPalette.open")}
      className={
        "hidden h-8 items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex " +
        (className ?? "")
      }
    >
      <Search className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{t("commandPalette.shortTrigger")}</span>
      <kbd className="ml-1 inline-flex items-center gap-0.5 rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 font-sans text-[10px] font-medium">
        <span>{isMac ? "⌘" : "Ctrl"}</span>
        <span>K</span>
      </kbd>
    </button>
  );
}
