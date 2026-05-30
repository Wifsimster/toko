import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail } from "lucide-react";
import { useSeoHead } from "@/hooks/use-seo-head";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

function Contact() {
  const { t } = useTranslation();
  useSeoHead({
    title: "Contacter Tokō — aide et support",
    description:
      "Une question sur Tokō ou sur vos données ? Écrivez-nous par email. Nous aidons les parents qui utilisent l'application au quotidien.",
    canonical: "https://toko.battistella.ovh/contact",
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("common.back")}
      </Link>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        {t("contact.title")}
      </h1>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("contact.contactUs")}
          </h2>
          <p>{t("contact.contactUsBody")}</p>
          <div className="mt-4 flex items-center gap-2">
            <Mail className="size-4" />
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
            {t("contact.rights")}
          </h2>
          <p>{t("contact.rightsBody")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("contact.report")}
          </h2>
          <p>{t("contact.reportBody")}</p>
        </section>
      </div>
    </div>
  );
}
