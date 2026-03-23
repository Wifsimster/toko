import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/confidentialite")({
  component: Confidentialite,
});

function Confidentialite() {
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
        Politique de confidentialité
      </h1>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Introduction
          </h2>
          <p>
            Toko s'engage à protéger la vie privée de ses utilisateurs. Cette
            politique de confidentialité décrit les données que nous collectons,
            comment nous les utilisons et les mesures que nous prenons pour les
            protéger.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Données collectées
          </h2>
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>Données de compte :</strong> adresse e-mail et nom, lors
              de la création de votre compte.
            </li>
            <li>
              <strong>Données de suivi :</strong> symptômes, médicaments,
              rendez-vous et notes de journal que vous saisissez dans
              l'application.
            </li>
            <li>
              <strong>Données techniques :</strong> cookies de session
              nécessaires au fonctionnement de l'application.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Utilisation des données
          </h2>
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul className="ml-4 mt-2 list-disc space-y-2">
            <li>
              Fournir les fonctionnalités de suivi de l'application.
            </li>
            <li>
              Générer des rapports et statistiques visibles uniquement par vous.
            </li>
            <li>
              Améliorer le fonctionnement et la fiabilité du service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Partage des données
          </h2>
          <p>
            Nous ne vendons, ne louons et ne partageons pas vos données
            personnelles avec des tiers à des fins commerciales. Vos données de
            suivi de santé restent strictement confidentielles.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Sécurité
          </h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et
            organisationnelles pour protéger vos données contre tout accès non
            autorisé, modification, divulgation ou destruction. Les connexions
            sont chiffrées et les mots de passe sont hashés.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Vos droits
          </h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="ml-4 mt-2 list-disc space-y-2">
            <li>
              <strong>Droit d'accès :</strong> obtenir une copie de vos données
              personnelles.
            </li>
            <li>
              <strong>Droit de rectification :</strong> corriger des données
              inexactes ou incomplètes.
            </li>
            <li>
              <strong>Droit de suppression :</strong> demander la suppression de
              vos données.
            </li>
            <li>
              <strong>Droit à la portabilité :</strong> recevoir vos données
              dans un format structuré et lisible.
            </li>
            <li>
              <strong>Droit d'opposition :</strong> vous opposer au traitement
              de vos données.
            </li>
          </ul>
          <p className="mt-2">
            Pour exercer ces droits, veuillez nous contacter via la page de
            contact.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Conservation des données
          </h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. En cas
            de suppression de votre compte, toutes vos données personnelles
            seront supprimées de nos serveurs.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Modifications
          </h2>
          <p>
            Cette politique de confidentialité peut être mise à jour
            ponctuellement. Toute modification sera publiée sur cette page.
          </p>
        </section>
      </div>
    </div>
  );
}
