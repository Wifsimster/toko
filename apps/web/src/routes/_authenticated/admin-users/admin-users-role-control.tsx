import { ShieldCheck, ShieldOff } from "lucide-react";
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
  const updateRole = useUpdateUserRole();
  const rolePending =
    updateRole.isPending && updateRole.variables?.id === user.id;
  // Mirrors the API guard: an admin can't strip their own role.
  const lockedSelf = isCurrentUser && user.isAdmin;

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Badge variant={user.isAdmin ? "secondary" : "outline"}>
        {user.isAdmin ? "Administrateur" : "Parent"}
      </Badge>
      {lockedSelf ? (
        <span className="text-xs text-muted-foreground">
          Vous ne pouvez pas modifier votre propre rôle
        </span>
      ) : user.isAdmin ? (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Retirer l'accès admin"
          buttonIcon={ShieldOff}
          buttonVariant="destructive"
          disabled={rolePending}
          title="Confirmer le changement de rôle"
          description={`${user.name} perdra l'accès aux pages d'administration.`}
          confirmLabel="Retirer l'accès admin"
          onConfirm={() => updateRole.mutate({ id: user.id, isAdmin: false })}
        />
      ) : (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Rendre administrateur"
          buttonIcon={ShieldCheck}
          buttonVariant="outline"
          disabled={rolePending}
          title="Confirmer le changement de rôle"
          description={`${user.name} aura accès à toutes les pages d'administration, y compris la gestion des utilisateurs.`}
          confirmLabel="Rendre administrateur"
          onConfirm={() => updateRole.mutate({ id: user.id, isAdmin: true })}
        />
      )}
    </div>
  );
}
