import { KeyRound, UserCheck } from "lucide-react";
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
          <Badge variant="destructive">Bloqué</Badge>
          {user.blockedReason && (
            <span className="max-w-[16rem] text-xs text-muted-foreground">
              {user.blockedReason}
            </span>
          )}
        </>
      ) : (
        <Badge variant="outline">Actif</Badge>
      )}
      {isCurrentUser ? (
        <span className="text-xs text-muted-foreground">
          Vous ne pouvez pas bloquer votre propre compte
        </span>
      ) : user.isBlocked ? (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Débloquer le compte"
          buttonIcon={UserCheck}
          buttonVariant="outline"
          disabled={blockPending}
          title="Débloquer ce compte"
          description={`${user.name} pourra de nouveau se connecter et utiliser Tokō.`}
          confirmLabel="Débloquer le compte"
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
        buttonLabel="Réinitialiser le mot de passe"
        buttonIcon={KeyRound}
        buttonVariant="outline"
        disabled={resetPending}
        title="Réinitialiser le mot de passe"
        description={`Un e-mail sera envoyé à ${user.email} avec un lien pour choisir un nouveau mot de passe. Le lien est valable 1 heure.`}
        confirmLabel="Envoyer le lien"
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
