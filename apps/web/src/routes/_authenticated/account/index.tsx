import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Trash2, Shield, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteAccount, useExportAccount } from "@/hooks/use-account";
import { useBillingStatus, useCheckout } from "@/hooks/use-billing";

export const Route = createFileRoute("/_authenticated/account/")({
  component: AccountPage,
});

function AccountPage() {
  const session = useSession();
  const deleteAccount = useDeleteAccount();
  const exportAccount = useExportAccount();
  const billing = useBillingStatus();
  const checkout = useCheckout();
  const [confirmation, setConfirmation] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteAccount.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Mon compte
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestion de vos donnees personnelles et droits RGPD
        </p>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Donnees associees a votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nom</span>
            <span>{session.data?.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{session.data?.user?.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Abonnement
          </CardTitle>
          <CardDescription>
            Gerez votre abonnement et votre facturation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billing.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : !billing.data || billing.data.status === "none" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Vous utilisez actuellement le plan Gratuit.
              </p>
              <Button
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending}
              >
                {checkout.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
                )}
                Passer au plan Famille
              </Button>
            </div>
          ) : billing.data.active ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={billing.data.status === "trialing" ? "secondary" : "default"}>
                  {billing.data.status === "trialing" ? "Essai" : "Actif"}
                </Badge>
                <span className="text-sm font-medium">Plan Famille</span>
              </div>
              {billing.data.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  {billing.data.status === "trialing" ? "Fin de l'essai" : "Prochain renouvellement"} :{" "}
                  {new Date(billing.data.currentPeriodEnd).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">
                  {billing.data.status === "past_due" ? "Paiement en retard" : "Annule"}
                </Badge>
                <span className="text-sm font-medium">Plan Famille</span>
              </div>
              {billing.data.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  Acces jusqu'au{" "}
                  {new Date(billing.data.currentPeriodEnd).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              <Button
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending}
              >
                {checkout.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
                )}
                Se reabonner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter mes donnees
          </CardTitle>
          <CardDescription>
            Telechargez une copie de toutes vos donnees personnelles au format
            JSON (Art. 20 RGPD — Droit a la portabilite)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => exportAccount.mutate()}
            disabled={exportAccount.isPending}
          >
            {exportAccount.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Download className="h-4 w-4" data-icon="inline-start" />
            )}
            {exportAccount.isPending
              ? "Export en cours..."
              : "Telecharger mes donnees"}
          </Button>
          {exportAccount.isSuccess && (
            <p className="mt-2 text-sm text-muted-foreground">
              Export telecharge avec succes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Account deletion */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </CardTitle>
          <CardDescription>
            Supprime definitivement votre compte et toutes les donnees associees
            (Art. 17 RGPD — Droit a l'effacement). Cette action est irreversible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4" data-icon="inline-start" />
                  Supprimer mon compte
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  Cette action est irreversible. Toutes vos donnees seront
                  definitivement supprimees : profil, enfants, symptomes,
                  medicaments, journal et abonnement.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="delete-confirmation">
                  Tapez <strong>DELETE</strong> pour confirmer
                </Label>
                <Input
                  id="delete-confirmation"
                  value={confirmation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmation(e.target.value)
                  }
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </div>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline" />}
                >
                  Annuler
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={
                    confirmation !== "DELETE" || deleteAccount.isPending
                  }
                >
                  {deleteAccount.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
                  ) : (
                    <Trash2 className="h-4 w-4" data-icon="inline-start" />
                  )}
                  Supprimer definitivement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
