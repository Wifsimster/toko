import { Ban, Crown } from "lucide-react";
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
  const updatePremium = useUpdateUserPremium();
  const premiumPending =
    updatePremium.isPending && updatePremium.variables?.id === user.id;

  return (
    <div className="flex flex-col items-start gap-1.5">
      {user.premiumGranted ? (
        <Badge variant="default">Premium accordé</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Non accordé</span>
      )}
      {user.premiumGranted ? (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Retirer le premium"
          buttonIcon={Ban}
          buttonVariant="destructive"
          disabled={premiumPending}
          title="Retirer l'accès premium"
          description={`${user.name} perdra l'accès premium accordé. Son accès dépendra alors de son abonnement Stripe.`}
          confirmLabel="Retirer le premium"
          onConfirm={() =>
            updatePremium.mutate({ id: user.id, premiumGranted: false })
          }
        />
      ) : (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Accorder le premium"
          buttonIcon={Crown}
          buttonVariant="outline"
          disabled={premiumPending}
          title="Accorder l'accès premium"
          description={`${user.name} aura un accès premium complet et gratuit, indépendamment de tout abonnement Stripe.`}
          confirmLabel="Accorder le premium"
          onConfirm={() =>
            updatePremium.mutate({ id: user.id, premiumGranted: true })
          }
        />
      )}
    </div>
  );
}
