import { useTranslation } from "react-i18next";
import { UserRound } from "lucide-react";

// Shows who first recorded an item. The API only sends `createdByName` when
// the child is shared with a co-parent — for a solo parent it is always
// null, so this renders nothing and keeps the card minimal (cf. design
// principles in CLAUDE.md).
export function CreatedByLabel({ name }: { name: string | null | undefined }) {
  const { t } = useTranslation();

  if (!name) return null;

  return (
    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
      <UserRound className="size-3 shrink-0" aria-hidden="true" />
      {t("common.addedBy", { name })}
    </p>
  );
}
