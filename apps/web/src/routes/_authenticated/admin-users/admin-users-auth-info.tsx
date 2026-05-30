import { MailCheck, MailWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AdminUser } from "@/hooks/use-admin-users";

function signInMethodLabel(providerId: string): string {
  switch (providerId) {
    case "credential":
      return "Mot de passe";
    case "google":
      return "Google";
    default:
      return providerId;
  }
}

export function AuthInfo({ user }: { user: AdminUser }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap gap-1">
        {user.authProviders.length > 0 ? (
          user.authProviders.map((p) => (
            <Badge key={p} variant="outline">
              {signInMethodLabel(p)}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">
            Aucune méthode
          </span>
        )}
      </div>
      {user.emailVerified ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MailCheck className="size-3.5" aria-hidden="true" />
          E-mail vérifié
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-500">
          <MailWarning className="size-3.5" aria-hidden="true" />
          E-mail non vérifié
        </span>
      )}
    </div>
  );
}
