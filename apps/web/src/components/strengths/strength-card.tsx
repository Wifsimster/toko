import { useTranslation } from "react-i18next";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Strength } from "@focusflow/validators";
import { categoryConfig } from "./category-config";

export function StrengthCard({
  strength,
  onEdit,
  onDelete,
}: {
  strength: Strength;
  onEdit: (s: Strength) => void;
  onDelete: (s: Strength) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const config = categoryConfig[strength.category];
  const emoji = strength.emoji?.trim() || config.fallbackEmoji;
  const dateLabel = new Date(strength.occurredOn).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card className={`ring-1 ${config.surfaceClass} border-transparent`}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge className={`${config.badgeClass} border-transparent`}>
            {t(config.labelKey)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 -mt-2 size-8 text-muted-foreground"
                  aria-label={t("strengths.itemActions")}
                />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(strength)}>
                <Pencil className="size-4 text-muted-foreground" />
                {t("strengths.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(strength)}>
                <Trash2 className="size-4 text-muted-foreground" />
                {t("strengths.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">
            {emoji}
          </span>
          <div className="flex-1 space-y-1.5">
            <p className="font-heading text-base font-semibold leading-snug text-foreground">
              {strength.title}
            </p>
            {strength.description && (
              <p className="text-sm leading-relaxed text-foreground/80">
                {strength.description}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{dateLabel}</p>
      </CardContent>
    </Card>
  );
}
