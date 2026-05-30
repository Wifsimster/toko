import { useTranslation } from "react-i18next";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreatedByLabel } from "@/components/shared/created-by-label";
import type { JournalTag, JournalEntry } from "@focusflow/validators";
import { tagConfig } from "./journal-card-data";

export function JournalCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry;
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (entry: JournalEntry) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const hasActions = !!(onEdit || onDelete);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-medium capitalize">
              {new Date(entry.date).toLocaleDateString(locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </CardTitle>
            <CreatedByLabel name={entry.createdByName} />
          </div>
          <div className="flex items-center gap-1">
            {hasActions && (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("journal.actionsLabel")}
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  }
                />
                <PopoverContent align="end" className="w-40 gap-0 p-1">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                    >
                      <Pencil className="size-4 text-muted-foreground" />
                      {t("child.edit")}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(entry)}
                      className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
                    >
                      <Trash2 className="size-4" />
                      {t("child.delete")}
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {entry.text && (
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {entry.text}
          </p>
        )}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag: string) => {
              const config = tagConfig[tag as JournalTag];
              return (
                <Badge
                  key={tag}
                  variant={config?.variant ?? "secondary"}
                  className="text-xs"
                >
                  {config ? t(config.labelKey) : tag}
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
