import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { FloatingTipButton } from "@/components/shared/floating-tip-button";
import { SOSCrisisButton } from "@/components/shared/sos-crisis-button";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";
import { AppUpdatedBanner } from "@/components/shared/app-updated-banner";
import { KoeWidget } from "@/components/koe-widget";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActiveChildSync } from "@/hooks/use-active-child-sync";
import { navItems, hubNavItems } from "@/config/nav";
import { cn } from "@/lib/utils";
import { trackSessionStart } from "@/lib/analytics";

export function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AuthenticatedShell />
    </SidebarProvider>
  );
}

function AuthenticatedShell() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useActiveChildSync();

  useEffect(() => {
    trackSessionStart();
  }, []);

  const activeNavItem = [...navItems, ...hubNavItems].find(
    (i) => pathname === i.to || pathname.startsWith(`${i.to}/`)
  );
  const activePageLabel = activeNavItem ? t(activeNavItem.labelKey) : "";

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        {t("nav.skipToContent")}
      </a>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {activePageLabel}
      </div>

      <AppSidebar />

      <SidebarInset
        id="main"
        tabIndex={-1}
        aria-labelledby="page-title"
        className={cn(
          "min-w-0 focus:outline-none",
          isMobile
            ? "pb-[calc(10.25rem+env(safe-area-inset-bottom))] landscape:max-md:pb-[calc(9.25rem+env(safe-area-inset-bottom))]"
            :
              "pb-24"
        )}
      >
        <AppHeader />

        <div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>

        {isMobile && <MobileTabBar />}
      </SidebarInset>

      <div className="pointer-events-none fixed print:hidden bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-end gap-3 md:bottom-6 md:right-6">
        <FloatingTipButton />
        <SOSCrisisButton />
      </div>
      <KoeWidget />
      <OnboardingGate />
      <AppUpdatedBanner />
    </>
  );
}
