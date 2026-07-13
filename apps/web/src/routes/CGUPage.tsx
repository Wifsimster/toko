import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { useSeoHead } from "@/hooks/use-seo-head";

// Section keys rendered in order. Each has a `.title` and a `.body` under
// `cgu.sections.<key>` in the locale files.
const SECTION_KEYS = [
  "object",
  "service",
  "account",
  "acceptableUse",
  "subscription",
  "medical",
  "data",
  "liability",
  "termination",
  "law",
] as const;

export function CGUPage() {
  const { t } = useTranslation();
  useSeoHead({
    title: "Conditions d'utilisation — Tokō",
    description:
      "Les conditions générales d'utilisation de Tokō : compte, abonnement, usage acceptable, responsabilité et droit applicable.",
    canonical: "https://toko.battistella.ovh/cgu",
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

      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        {t("cgu.title")}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">{t("cgu.updated")}</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        {SECTION_KEYS.map((key) => (
          <section key={key}>
            <h2 className="mb-3 text-lg font-medium text-foreground">
              {t(`cgu.sections.${key}.title`)}
            </h2>
            <p className="whitespace-pre-line">
              {t(`cgu.sections.${key}.body`)}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
