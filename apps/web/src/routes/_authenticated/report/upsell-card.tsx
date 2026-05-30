import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckout } from "@/hooks/use-billing";

export function UpsellCard() {
  const checkout = useCheckout();
  return (
    <Card className="mt-8 border-primary/20 bg-gradient-to-br from-accent/10 to-transparent print:hidden">
      <CardHeader>
        <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <CardTitle className="font-heading text-xl">
          Aller plus loin avec Famille
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Vous utilisez le carnet gratuit. Le plan Famille débloque les
          fonctionnalités utiles aux titrations longues et aux dossiers MDPH.
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>Période 90 jours et plages personnalisées (suivi des tendances)</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>Carnet consolidé pour plusieurs enfants en un seul document</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>Envoi direct du carnet par email au médecin</span>
          </li>
        </ul>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 shadow-sm"
            onClick={() => checkout.mutate()}
            disabled={checkout.isPending}
          >
            Essayer Famille 14 jours gratuits
          </Button>
          <Link to="/ressources">
            <Button variant="outline" size="lg">
              Lire les ressources gratuites
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground/80">
          Sans carte bancaire pendant l'essai · Annulable en 1 clic
        </p>
      </CardContent>
    </Card>
  );
}
