import { useTranslation } from "react-i18next";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

// Shows who first recorded an item. The API only sends `createdByName` when
// the child is shared with a co-parent — for a solo parent it is always
// null, so this renders nothing and keeps the card minimal (cf. design
// principles in AGENTS.md). A long or unbreakable name wraps inside the
// card instead of pushing the card's actions out.
export function CreatedByLabel({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const { t } = useTranslation();

  if (!name) return null;

  return (
    <p
      className={cn(
        "mt-0.5 flex min-w-0 items-start gap-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <UserRound className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
      <span className="min-w-0 [overflow-wrap:anywhere]">
        {t("common.addedBy", { name })}
      </span>
    </p>
  );
}
