import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/mentions-legales")({
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Mentions légales
      </h1>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Éditeur du site
          </h2>
          <p>
            Toko est une application web éditée à titre personnel.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Hébergement
          </h2>
          <p>
            Ce site est hébergé par des services d'hébergement cloud. Les
            données sont stockées sur des serveurs sécurisés.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Propriété intellectuelle
          </h2>
          <p>
            L'ensemble du contenu de ce site (textes, images, graphismes, logo,
            icônes) est la propriété exclusive de l'éditeur, sauf mention
            contraire. Toute reproduction, représentation, modification ou
            adaptation de tout ou partie du site est interdite sans
            autorisation préalable.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Données personnelles
          </h2>
          <p>
            Les données collectées via cette application sont utilisées
            uniquement dans le cadre du suivi proposé par Toko. Aucune donnée
            personnelle n'est vendue ou transmise à des tiers à des fins
            commerciales.
          </p>
          <p className="mt-2">
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), vous disposez d'un droit d'accès, de rectification, de
            suppression et de portabilité de vos données. Pour exercer ces
            droits, veuillez nous contacter.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Cookies
          </h2>
          <p>
            Ce site utilise des cookies strictement nécessaires au
            fonctionnement de l'application (authentification, session). Aucun
            cookie de traçage publicitaire n'est utilisé.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Responsabilité
          </h2>
          <p>
            Toko est un outil d'aide au suivi et ne constitue en aucun cas un
            avis médical. Les informations fournies par l'application ne
            remplacent pas une consultation auprès d'un professionnel de santé.
            L'éditeur ne saurait être tenu responsable de l'utilisation qui est
            faite des informations présentes sur ce site.
          </p>
        </section>
      </div>
    </div>
  );
}
