import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminUser } from "@/hooks/use-admin-users";
import { AuthInfo } from "./admin-users-auth-info";
import { ManageUserSheet } from "./admin-users-manage-sheet";
import { CardField } from "./admin-users-card-field";
import { formatDate, subscriptionBadge } from "./admin-users-utils";

export function UserCard({
  user,
  isCurrentUser,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
}) {
  const sub = subscriptionBadge(user);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="min-w-0">
          <div className="font-medium text-foreground">
            {user.name}
            {isCurrentUser && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                (vous)
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground break-all">
            {user.email}
          </div>
        </div>
        <div className="space-y-2 border-t border-border/60 pt-3">
          <CardField label="Abonnement">
            <Badge variant={sub.variant}>{sub.label}</Badge>
          </CardField>
          <CardField label="Rôle">
            <Badge variant={user.isAdmin ? "secondary" : "outline"}>
              {user.isAdmin ? "Administrateur" : "Parent"}
            </Badge>
          </CardField>
          <CardField label="Accès premium">
            {user.premiumGranted ? (
              <Badge variant="default">Premium accordé</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Non accordé</span>
            )}
          </CardField>
          <CardField label="Compte">
            {user.isBlocked && <Badge variant="destructive">Bloqué</Badge>}
            {user.deletionScheduledAt && (
              <Badge variant="destructive">Suppression programmée</Badge>
            )}
            {!user.isBlocked && !user.deletionScheduledAt && (
              <Badge variant="outline">Actif</Badge>
            )}
          </CardField>
        </div>
        <AuthInfo user={user} />
        <p className="text-xs text-muted-foreground">
          Inscrit le {formatDate(user.createdAt)}
        </p>
        <ManageUserSheet user={user} isCurrentUser={isCurrentUser} />
      </CardContent>
    </Card>
  );
}
