import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { FloatingTipButton } from "@/components/shared/floating-tip-button";
import { SOSCrisisButton } from "@/components/shared/sos-crisis-button";
import { LockOverlay } from "@/components/shared/lock-overlay";
import { OnboardingTour } from "@/components/shared/onboarding-tour";
import { KoeWidget } from "@/components/koe-widget";
import { useIdleLock } from "@/hooks/use-idle-lock";
import { useIsMobile } from "@/hooks/use-mobile";
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

  // Business rule E5: auto-lock the parent screen after 5 minutes of idle.
  useIdleLock();

  // Fire session_started on first mount of any authenticated shell.
  // The helper itself debounces across page-loads with a 30-min TTL so
  // hard refreshes / soft navigations don't double-count.
  useEffect(() => {
    trackSessionStart();
  }, []);

  // Announce the active page to screen readers when the route changes.
  // Search hub items too: the daily-tracking screens moved under /suivi but
  // still need their page announced to screen readers on navigation.
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
          // Scroll room for the two fixed layers stacked at the bottom of the
          // mobile viewport: the tab bar (3.5rem) and, above it, the SOS/tip
          // buttons (size-14 sitting 5.75rem from the edge — see the floating
          // container below). Without the taller padding the last card on
          // every page stays permanently hidden behind the floating buttons.
          isMobile
            ? "pb-[calc(10.25rem+env(safe-area-inset-bottom))] landscape:max-md:pb-[calc(9.25rem+env(safe-area-inset-bottom))]"
            : // md and up there is no tab bar, but the SOS button still floats
              // 1.5rem from the bottom edge (3.5rem tall = 5rem of occupied
              // space). 6rem keeps the last card clear of it on tablet and
              // desktop alike, where previously nothing was reserved at all.
              "pb-24"
        )}
      >
        <AppHeader />

        <div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>

        {isMobile && <MobileTabBar />}
      </SidebarInset>

      {/* Floating buttons. On mobile they necessarily sit over scrolling
          content: the SOS button has to stay reachable at all times, so it is
          never hidden or collapsed on scroll (cf. "pas de surprises" in
          CLAUDE.md). It gets breathing room instead — 2.25rem above the tab
          bar (3.5rem) rather than 1.5rem — so the two fixed layers no longer
          read as a single block glued to the bottom of the screen. The
          `ring-background` moat on the SOS button keeps it legible as a
          separate layer when text scrolls underneath it. */}
      <div className="pointer-events-none fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-end gap-3 md:bottom-6 md:right-6">
        <FloatingTipButton />
        <SOSCrisisButton />
      </div>
      <KoeWidget />
      <LockOverlay />
      <OnboardingTour />
    </>
  );
}
