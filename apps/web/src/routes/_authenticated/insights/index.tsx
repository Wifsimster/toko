import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/shared/empty-state";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import {
  PAYWALL_VARIANT as BUILD_TIME_PAYWALL_VARIANT,
  type PaywallVariant,
} from "@/lib/paywall-variant";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useUiStore } from "@/stores/ui-store";
import { useChildren } from "@/hooks/use-children";
import { useBillingStatus } from "@/hooks/use-billing";
import {
  MonthlyTrends,
  QuarterlyTrends,
  BehaviorCorrelation,
  TrendReading,
} from "./insights-sections";

export const Route = createFileRoute("/_authenticated/insights/")({
  component: InsightsPage,
  staticData: { crumb: "nav.insights" },
});

function InsightsPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: children, isLoading } = useChildren();
  const billing = useBillingStatus();
  const showValueProp = !billing.isLoading && !billing.data?.active;
  const paywallVariant = useFeatureFlag<PaywallVariant>(
    "paywall_variant",
    BUILD_TIME_PAYWALL_VARIANT,
  );

  if (isLoading) return <PageLoader />;

  if (!activeChildId || !children?.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("insights.title")}
          description={t("insights.subtitle")}
        />
        <EmptyState title={t("insights.noChild")} />
      </div>
    );
  }

  const childName = children.find((c) => c.id === activeChildId)?.name;
  const isActive = !billing.isLoading && !!billing.data?.active;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("insights.reading.title")}
        description={
          childName ? t("insights.reading.subtitleWithName", { name: childName }) : t("insights.subtitle")
        }
      />

      {isActive && <TrendReading childId={activeChildId} />}

      {showValueProp && (
        <Card className="border-brand/30 bg-brand/5">
          <CardContent className="py-4 space-y-2">
            <p className="font-medium text-sm">
              {t(`premiumGate.variants.${paywallVariant}.title`)}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(`premiumGate.variants.${paywallVariant}.subtitle`)}
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              {t(`premiumGate.variants.${paywallVariant}.body`)}
            </p>
          </CardContent>
        </Card>
      )}

      <MonthlyTrends childId={activeChildId} />
      <QuarterlyTrends childId={activeChildId} />
      <BehaviorCorrelation childId={activeChildId} />

      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("insights.disclaimer")}{" "}
        <Link to="/report" className="font-semibold text-brand-strong underline underline-offset-4">
          {t("insights.reading.report")}
        </Link>
      </p>
    </div>
  );
}
