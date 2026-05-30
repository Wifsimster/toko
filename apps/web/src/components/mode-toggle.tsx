import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const OPTIONS: ReadonlyArray<{
  value: ThemeOption;
  labelKey: string;
  icon: typeof Sun;
}> = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: Monitor },
];

export function ModeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const mounted = true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("theme.toggle")}
            className={cn("relative", className)}
          />
        }
      >
        <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          <span className="text-xs font-medium text-muted-foreground">
            {t("theme.label")}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map(({ value, labelKey, icon: Icon }) => {
          const isActive = mounted && theme === value;
          return (
            <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
              <Icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span>{t(labelKey)}</span>
              {isActive && (
                <Check
                  className="ml-auto size-4 text-primary"
                  aria-hidden="true"
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
