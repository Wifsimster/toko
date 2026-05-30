import { Badge } from "@/components/ui/badge";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import type { AdminUser } from "@/hooks/use-admin-users";
import { AuthInfo } from "./admin-users-auth-info";
import { ManageUserSheet } from "./admin-users-manage-sheet";
import { formatDate, subscriptionBadge } from "./admin-users-utils";

export function UserRow({
  user,
  isCurrentUser,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
}) {
  const sub = subscriptionBadge(user);

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-foreground">
          {user.name}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              (vous)
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </TableCell>
      <TableCell>
        <AuthInfo user={user} />
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell>
        <Badge variant={sub.variant}>{sub.label}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={user.isAdmin ? "secondary" : "outline"}>
          {user.isAdmin ? "Administrateur" : "Parent"}
        </Badge>
      </TableCell>
      <TableCell>
        {user.premiumGranted ? (
          <Badge variant="default">Premium accordé</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Non accordé</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1.5">
          {user.deletionScheduledAt && (
            <Badge variant="destructive">Suppression programmée</Badge>
          )}
          {user.isBlocked && <Badge variant="destructive">Bloqué</Badge>}
          {!user.deletionScheduledAt && !user.isBlocked && (
            <Badge variant="outline">Actif</Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <ManageUserSheet
          user={user}
          isCurrentUser={isCurrentUser}
          side="right"
        />
      </TableCell>
    </TableRow>
  );
}
