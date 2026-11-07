import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LexiqueBrowser } from "@/components/lexique/lexique-browser";

export const Route = createFileRoute("/_authenticated/lexique/")({
  component: LexiqueIndex,
  staticData: {
    crumb: "nav.lexicon",
  },
});

function LexiqueIndex() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <LexiqueBrowser
        articleRoute="/connaissances/$slug"
        title={t("lexicon.title")}
        subtitle={t("lexicon.subtitle")}
      />

      <p className="mt-10 text-xs text-muted-foreground">
        {t("lexicon.disclaimer")}
      </p>
    </div>
  );
}
