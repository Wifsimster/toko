import { Ban, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { useUpdateUserPremium, type AdminUser } from "@/hooks/use-admin-users";
import { ConfirmAction } from "./admin-users-confirm-action";

export function PremiumControl({
  user,
  fullWidth,
}: {
  user: AdminUser;
  fullWidth?: boolean;
}) {
  const { t } = useTranslation();
  const updatePremium = useUpdateUserPremium();
  const premiumPending =
    updatePremium.isPending && updatePremium.variables?.id === user.id;

  return (
    <div className="flex flex-col items-start gap-1.5">
      {user.premiumGranted ? (
        <Badge variant="default">{t("adminUsers.premium.granted")}</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">
          {t("adminUsers.premium.notGranted")}
        </span>
      )}
      {user.premiumGranted ? (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel={t("adminUsers.premium.revokeButton")}
          buttonIcon={Ban}
          buttonVariant="destructive"
          disabled={premiumPending}
          title={t("adminUsers.premium.revokeTitle")}
          description={t("adminUsers.premium.revokeDescription", {
            name: user.name,
          })}
          confirmLabel={t("adminUsers.premium.revokeConfirm")}
          onConfirm={() =>
            updatePremium.mutate({ id: user.id, premiumGranted: false })
          }
        />
      ) : (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel={t("adminUsers.premium.grantButton")}
          buttonIcon={Crown}
          buttonVariant="outline"
          disabled={premiumPending}
          title={t("adminUsers.premium.grantTitle")}
          description={t("adminUsers.premium.grantDescription", {
            name: user.name,
          })}
          confirmLabel={t("adminUsers.premium.grantConfirm")}
          onConfirm={() =>
            updatePremium.mutate({ id: user.id, premiumGranted: true })
          }
        />
      )}
    </div>
  );
}
