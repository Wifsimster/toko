import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  fr: "Français",
  en: "English",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "fr") as SupportedLanguage;

  const changeLanguage = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("common.language")}
            className={cn("gap-1.5 px-2", className)}
          >
            <Languages className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">{current}</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-40 p-1">
        <div className="flex flex-col">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => changeLanguage(lang)}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                lang === current && "bg-accent/50 font-medium"
              )}
            >
              <span>{LANGUAGE_LABELS[lang]}</span>
              <span className="text-xs uppercase text-muted-foreground">
                {lang}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
