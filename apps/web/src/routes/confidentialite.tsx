import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/confidentialite")({
  component: Confidentialite,
});

function Confidentialite() {
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
        {t("privacy.title")}
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("privacy.intro")}
          </h2>
          <p>{t("privacy.introBody")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("privacy.collected")}
          </h2>
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>{t("privacy.collectedAccountLabel")}</strong>{" "}
              {t("privacy.collectedAccountBody")}
            </li>
            <li>
              <strong>{t("privacy.collectedTrackingLabel")}</strong>{" "}
              {t("privacy.collectedTrackingBody")}
            </li>
            <li>
              <strong>{t("privacy.collectedTechnicalLabel")}</strong>{" "}
              {t("privacy.collectedTechnicalBody")}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("privacy.usage")}
          </h2>
          <p>{t("privacy.usageIntro")}</p>
          <ul className="ml-4 mt-2 list-disc space-y-2">
            <li>{t("privacy.usage1")}</li>
            <li>{t("privacy.usage2")}</li>
            <li>{t("privacy.usage3")}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("privacy.sharing")}
          </h2>
          <p>{t("privacy.sharingBody")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("privacy.security")}
          </h2>
          <p>{t("privacy.securityBody")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("privacy.rights")}
          </h2>
          <p>{t("privacy.rightsIntro")}</p>
          <ul className="ml-4 mt-2 list-disc space-y-2">
            <li>
              <strong>{t("privacy.rightAccessLabel")}</strong>{" "}
              {t("privacy.rightAccessBody")}
            </li>
            <li>
              <strong>{t("privacy.rightRectifyLabel")}</strong>{" "}
              {t("privacy.rightRectifyBody")}
            </li>
            <li>
              <strong>{t("privacy.rightDeleteLabel")}</strong>{" "}
              {t("privacy.rightDeleteBody")}
            </li>
            <li>
              <strong>{t("privacy.rightPortabilityLabel")}</strong>{" "}
              {t("privacy.rightPortabilityBody")}
            </li>
            <li>
              <strong>{t("privacy.rightObjectLabel")}</strong>{" "}
              {t("privacy.rightObjectBody")}
            </li>
          </ul>
          <p className="mt-2">{t("privacy.rightsContact")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("privacy.retention")}
          </h2>
          <p>{t("privacy.retentionBody")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            {t("privacy.updates")}
          </h2>
          <p>{t("privacy.updatesBody")}</p>
        </section>
      </div>
    </div>
  );
}
