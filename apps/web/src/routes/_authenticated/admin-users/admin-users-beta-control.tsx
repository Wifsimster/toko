import { FlaskConical, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUpdateUserBeta, type AdminUser } from "@/hooks/use-admin-users";

export function BetaControl({
  user,
  fullWidth,
}: {
  user: AdminUser;
  fullWidth?: boolean;
}) {
  const updateBeta = useUpdateUserBeta();
  const pending =
    updateBeta.isPending && updateBeta.variables?.id === user.id;

  return (
    <div className="flex flex-col items-start gap-1.5">
      {user.betaCohort ? (
        <Badge variant="default">Bêta fermée</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Hors bêta</span>
      )}
      <Button
        variant={user.betaCohort ? "destructive" : "outline"}
        size="sm"
        className={fullWidth ? "w-full" : undefined}
        disabled={pending}
        onClick={() =>
          updateBeta.mutate({ id: user.id, betaCohort: !user.betaCohort })
        }
      >
        {user.betaCohort ? (
          <>
            <X className="size-4" data-icon="inline-start" />
            Retirer de la bêta
          </>
        ) : (
          <>
            <FlaskConical className="size-4" data-icon="inline-start" />
            Ajouter à la bêta
          </>
        )}
      </Button>
    </div>
  );
}
