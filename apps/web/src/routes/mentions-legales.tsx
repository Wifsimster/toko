import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/mentions-legales")({
  component: MentionsLegales,
});

function MentionsLegales() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        {t("legal.title")}
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("legal.editor")}
          </h2>
          <p>{t("legal.editorBody")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("legal.hosting")}
          </h2>
          <p>{t("legal.hostingBody")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("legal.ip")}
          </h2>
          <p>{t("legal.ipBody")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("legal.personalData")}
          </h2>
          <p>{t("legal.personalDataBody1")}</p>
          <p className="mt-2">{t("legal.personalDataBody2")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("legal.cookies")}
          </h2>
          <p>{t("legal.cookiesBody")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("legal.liability")}
          </h2>
          <p>{t("legal.liabilityBody")}</p>
        </section>
      </div>
    </div>
  );
}
