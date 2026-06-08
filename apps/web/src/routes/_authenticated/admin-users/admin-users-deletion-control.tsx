import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  useScheduleUserDeletion,
  useCancelUserDeletion,
  type AdminUser,
} from "@/hooks/use-admin-users";
import { ConfirmAction } from "./admin-users-confirm-action";
import { DeleteUserDialog } from "./admin-users-delete-dialog";

const DELETION_GRACE_DAYS = 30;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function scheduledDeletionDate(scheduledAtIso: string): string {
  const d = new Date(scheduledAtIso);
  d.setDate(d.getDate() + DELETION_GRACE_DAYS);
  return formatDate(d.toISOString());
}

export function DeletionControl({
  user,
  isCurrentUser,
  fullWidth,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  fullWidth?: boolean;
}) {
  const { t } = useTranslation();
  const scheduleDeletion = useScheduleUserDeletion();
  const cancelDeletion = useCancelUserDeletion();
  const pending =
    (scheduleDeletion.isPending && scheduleDeletion.variables === user.id) ||
    (cancelDeletion.isPending && cancelDeletion.variables === user.id);

  return (
    <div className="flex flex-col items-start gap-1.5">
      {user.deletionScheduledAt ? (
        <>
          <Badge variant="destructive">
            {t("adminUsers.deletion.scheduled")}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {t("adminUsers.deletion.deletedOn", {
              date: scheduledDeletionDate(user.deletionScheduledAt),
            })}
          </span>
          <ConfirmAction
            fullWidth={fullWidth}
            buttonLabel={t("adminUsers.deletion.cancelButton")}
            buttonIcon={RotateCcw}
            buttonVariant="outline"
            disabled={pending}
            title={t("adminUsers.deletion.cancelTitle")}
            description={t("adminUsers.deletion.cancelDescription", {
              name: user.name,
            })}
            confirmLabel={t("adminUsers.deletion.cancelConfirm")}
            onConfirm={() => cancelDeletion.mutate(user.id)}
          />
        </>
      ) : isCurrentUser ? (
        <span className="text-xs text-muted-foreground">
          {t("adminUsers.deletion.cannotDeleteSelf")}
        </span>
      ) : user.isAdmin ? (
        <span className="text-xs text-muted-foreground">
          {t("adminUsers.deletion.cannotDeleteAdmin")}
        </span>
      ) : (
        <DeleteUserDialog
          user={user}
          fullWidth={fullWidth}
          disabled={pending}
          onConfirm={() => scheduleDeletion.mutate(user.id)}
        />
      )}
    </div>
  );
}
