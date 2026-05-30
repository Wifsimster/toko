import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const OPTIONS: ReadonlyArray<{
  value: ThemeOption;
  labelKey: string;
  descriptionKey: string;
  icon: typeof Sun;
}> = [
  {
    value: "light",
    labelKey: "theme.light",
    descriptionKey: "theme.lightDescription",
    icon: Sun,
  },
  {
    value: "dark",
    labelKey: "theme.dark",
    descriptionKey: "theme.darkDescription",
    icon: Moon,
  },
  {
    value: "system",
    labelKey: "theme.system",
    descriptionKey: "theme.systemDescription",
    icon: Monitor,
  },
];

export function ThemeCard() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const value = (mounted ? theme : "system") as ThemeOption;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-4" />
          {t("theme.label")}
        </CardTitle>
        <CardDescription>{t("theme.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup<ThemeOption>
          value={value}
          onValueChange={(next) => setTheme(next)}
          className="grid gap-2 sm:grid-cols-3"
        >
          {OPTIONS.map(({ value: optValue, labelKey, descriptionKey, icon: Icon }) => {
            const isActive = mounted && theme === optValue;
            return (
              <RadioGroupItem
                key={optValue}
                value={optValue}
                aria-label={t(labelKey)}
                className={cn(
                  "rounded-lg border p-3 text-left",
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "size-4",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{t(labelKey)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(descriptionKey)}
                </p>
              </RadioGroupItem>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
