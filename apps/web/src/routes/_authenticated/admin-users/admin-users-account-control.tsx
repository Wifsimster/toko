import { KeyRound, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  useBlockUser,
  useResetUserPassword,
  type AdminUser,
} from "@/hooks/use-admin-users";
import { ConfirmAction } from "./admin-users-confirm-action";
import { BlockUserDialog } from "./admin-users-block-dialog";
import { DeletionControl } from "./admin-users-deletion-control";

export function AccountControl({
  user,
  isCurrentUser,
  fullWidth,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  fullWidth?: boolean;
}) {
  const { t } = useTranslation();
  const blockUser = useBlockUser();
  const resetPassword = useResetUserPassword();
  const blockPending =
    blockUser.isPending && blockUser.variables?.id === user.id;
  const resetPending =
    resetPassword.isPending && resetPassword.variables === user.id;

  return (
    <div className="flex flex-col items-start gap-1.5">
      {user.isBlocked ? (
        <>
          <Badge variant="destructive">
            {t("adminUsers.account.blocked")}
          </Badge>
          {user.blockedReason && (
            <span className="max-w-[16rem] text-xs text-muted-foreground">
              {user.blockedReason}
            </span>
          )}
        </>
      ) : (
        <Badge variant="outline">{t("adminUsers.account.active")}</Badge>
      )}
      {isCurrentUser ? (
        <span className="text-xs text-muted-foreground">
          {t("adminUsers.account.cannotBlockSelf")}
        </span>
      ) : user.isBlocked ? (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel={t("adminUsers.account.unblockButton")}
          buttonIcon={UserCheck}
          buttonVariant="outline"
          disabled={blockPending}
          title={t("adminUsers.account.unblockTitle")}
          description={t("adminUsers.account.unblockDescription", {
            name: user.name,
          })}
          confirmLabel={t("adminUsers.account.unblockConfirm")}
          onConfirm={() => blockUser.mutate({ id: user.id, isBlocked: false })}
        />
      ) : (
        <BlockUserDialog
          user={user}
          fullWidth={fullWidth}
          disabled={blockPending}
          onConfirm={(reason) =>
            blockUser.mutate({
              id: user.id,
              isBlocked: true,
              reason: reason || undefined,
            })
          }
        />
      )}
      <ConfirmAction
        fullWidth={fullWidth}
        buttonLabel={t("adminUsers.account.resetPasswordButton")}
        buttonIcon={KeyRound}
        buttonVariant="outline"
        disabled={resetPending}
        title={t("adminUsers.account.resetPasswordTitle")}
        description={t("adminUsers.account.resetPasswordDescription", {
          email: user.email,
        })}
        confirmLabel={t("adminUsers.account.resetPasswordConfirm")}
        onConfirm={() => resetPassword.mutate(user.id)}
      />
      <div className="mt-1 w-full border-t border-border/60 pt-3">
        <DeletionControl
          user={user}
          isCurrentUser={isCurrentUser}
          fullWidth={fullWidth}
        />
      </div>
    </div>
  );
}
