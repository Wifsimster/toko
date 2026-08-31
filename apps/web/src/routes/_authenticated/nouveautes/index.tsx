import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/page-header";
import { ChangelogList } from "@/components/changelog/changelog-list";

export const Route = createFileRoute("/_authenticated/nouveautes/")({
  component: NouveautesPage,
  staticData: {
    crumb: "nav.changelog",
    // La page se rejoint depuis le bas de « Mon compte » : le fil d'Ariane
    // garde ce chemin visible plutôt que de la faire flotter à la racine.
    crumbParent: { to: "/account", crumb: "nav.account" },
  },
});

function NouveautesPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t("changelog.title")}
        description={t("changelog.subtitle")}
      />
      <ChangelogList />
    </div>
  );
}
