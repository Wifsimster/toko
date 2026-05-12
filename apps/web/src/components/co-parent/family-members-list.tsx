import { useTranslation } from "react-i18next";
import { Loader2, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useFamilyCoParents,
  useRevokeFamilyAccess,
  type FamilyCoParent,
} from "@/hooks/use-child-access";

// Lists co-parents who have access to any of the current user's owned
// children. One row per co-parent regardless of how many children they're
// shared on — keeps the screen scannable.
export function FamilyMembersList() {
  const { t } = useTranslation();
  const family = useFamilyCoParents();

  if (family.isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  const rows = family.data?.coParents ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-center">
        <p className="text-sm font-medium">{t("familyShare.emptyTitle")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("familyShare.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("familyShare.membersTitle")}
      </p>
      <ul className="space-y-2">
        {rows.map((row) => (
          <FamilyMemberRow key={row.userId} row={row} />
        ))}
      </ul>
    </div>
  );
}

interface RowProps {
  row: FamilyCoParent;
}

function FamilyMemberRow({ row }: RowProps) {
  const { t, i18n: i18nInstance } = useTranslation();
  const revoke = useRevokeFamilyAccess();
  const since = new Date(row.grantedAt).toLocaleDateString(
    i18nInstance.language || "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );
  const displayName = row.userName?.trim() || row.userEmail;

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.userEmail}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("familyShare.memberChildrenCount", {
              count: row.childIds.length,
            })}
            {" · "}
            {t("familyShare.memberSince", { date: since })}
          </p>
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={revoke.isPending}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label={t("childAccess.revokeAria", { name: displayName })}
            >
              {revoke.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("familyShare.revokeConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("familyShare.revokeConfirmDescription", {
                name: displayName,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("familyShare.revokeCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revoke.mutate(row.userId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("familyShare.revokeConfirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
