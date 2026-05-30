import type { AdminUser } from "@/hooks/use-admin-users";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function subscriptionBadge(u: AdminUser): {
  label: string;
  variant: BadgeVariant;
} {
  const status = u.subscriptionStatus;
  if (!status) return { label: "Aucun", variant: "outline" };

  const paused =
    u.subscriptionPausedUntil != null &&
    new Date(u.subscriptionPausedUntil) > new Date();
  if (paused) return { label: "En pause", variant: "outline" };

  switch (status) {
    case "active":
      return u.subscriptionCancelAtPeriodEnd
        ? { label: "Annulation prévue", variant: "outline" }
        : { label: "Abonné", variant: "secondary" };
    case "trialing":
      return { label: "Essai", variant: "secondary" };
    case "past_due":
    case "unpaid":
      return { label: "Paiement en retard", variant: "destructive" };
    case "canceled":
      return { label: "Annulé", variant: "outline" };
    default:
      return { label: "Inactif", variant: "outline" };
  }
}
