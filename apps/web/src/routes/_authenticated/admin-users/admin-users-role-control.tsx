import { ShieldCheck, ShieldOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { useUpdateUserRole, type AdminUser } from "@/hooks/use-admin-users";
import { ConfirmAction } from "./admin-users-confirm-action";

export function RoleControl({
  user,
  isCurrentUser,
  fullWidth,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  fullWidth?: boolean;
}) {
  const { t } = useTranslation();
  const updateRole = useUpdateUserRole();
  const rolePending =
    updateRole.isPending && updateRole.variables?.id === user.id;
  // Mirrors the API guard: an admin can't strip their own role.
  const lockedSelf = isCurrentUser && user.isAdmin;

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Badge variant={user.isAdmin ? "secondary" : "outline"}>
        {user.isAdmin
          ? t("adminUsers.role.admin")
          : t("adminUsers.role.parent")}
      </Badge>
      {lockedSelf ? (
        <span className="text-xs text-muted-foreground">
          {t("adminUsers.role.cannotChangeSelf")}
        </span>
      ) : user.isAdmin ? (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel={t("adminUsers.role.removeButton")}
          buttonIcon={ShieldOff}
          buttonVariant="destructive"
          disabled={rolePending}
          title={t("adminUsers.role.removeTitle")}
          description={t("adminUsers.role.removeDescription", {
            name: user.name,
          })}
          confirmLabel={t("adminUsers.role.removeConfirm")}
          onConfirm={() => updateRole.mutate({ id: user.id, isAdmin: false })}
        />
      ) : (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel={t("adminUsers.role.grantButton")}
          buttonIcon={ShieldCheck}
          buttonVariant="outline"
          disabled={rolePending}
          title={t("adminUsers.role.grantTitle")}
          description={t("adminUsers.role.grantDescription", {
            name: user.name,
          })}
          confirmLabel={t("adminUsers.role.grantConfirm")}
          onConfirm={() => updateRole.mutate({ id: user.id, isAdmin: true })}
        />
      )}
    </div>
  );
}
