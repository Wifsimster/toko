import { createFileRoute } from "@tanstack/react-router";
import { BookA } from "lucide-react";
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <BookA className="size-6 text-primary" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("lexicon.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">{t("lexicon.subtitle")}</p>
      </div>

      <LexiqueBrowser articleRoute="/connaissances/$slug" />

      <p className="mt-10 text-xs text-muted-foreground">
        {t("lexicon.disclaimer")}
      </p>
    </div>
  );
}
