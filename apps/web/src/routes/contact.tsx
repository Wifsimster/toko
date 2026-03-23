import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Contact</h1>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Nous contacter
          </h2>
          <p>
            Pour toute question, suggestion ou demande concernant Toko,
            n'hésitez pas à nous contacter par e-mail.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a
              href="mailto:contact@toko.app"
              className="text-primary underline-offset-4 hover:underline"
            >
              contact@toko.app
            </a>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Exercer vos droits
          </h2>
          <p>
            Conformément au RGPD, vous pouvez exercer vos droits d'accès, de
            rectification, de suppression et de portabilité de vos données en
            nous écrivant à l'adresse ci-dessus. Nous nous engageons à
            répondre dans un délai de 30 jours.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            Signaler un problème
          </h2>
          <p>
            Si vous rencontrez un bug ou un problème technique, merci de nous
            le signaler par e-mail en décrivant le plus précisément possible
            les étapes pour le reproduire.
          </p>
        </section>
      </div>
    </div>
  );
}
