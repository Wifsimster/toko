import {
  createFileRoute,
  Outlet,
  Link,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LogOut, LifeBuoy, ChevronDown, Menu, Lock, UserCog, Compass, Award, History } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChildSelector } from "@/components/shared/child-selector";
import { ModeToggle } from "@/components/mode-toggle";
import { KoeWidget, useKoeTrigger } from "@/components/koe-widget";
import { FloatingTipButton } from "@/components/shared/floating-tip-button";
import { SOSCrisisButton } from "@/components/shared/sos-crisis-button";
import { LockOverlay } from "@/components/shared/lock-overlay";
import { OnboardingTour } from "@/components/shared/onboarding-tour";
import { useIdleLock } from "@/hooks/use-idle-lock";
import { useUiStore } from "@/stores/ui-store";
import { Breadcrumbs, useBreadcrumbs } from "@/components/layout/breadcrumbs";
import { navGroups, navItems, primaryNavItems } from "@/config/nav";
import {
  getCachedSession,
  invalidateSessionCache,
  useSession,
  signOut,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { trackSessionStart } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await getCachedSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
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
  const activeNavItem = navItems.find(
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
          isMobile &&
            "pb-[calc(4.5rem+env(safe-area-inset-bottom))] landscape:max-md:pb-[calc(3.5rem+env(safe-area-inset-bottom))]"
        )}
      >
        <AppHeader />

        <div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>

        {isMobile && <MobileTabBar />}
      </SidebarInset>

      <div className="pointer-events-none fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-end gap-3 lg:bottom-6 lg:right-6">
        <FloatingTipButton />
        <SOSCrisisButton />
      </div>
      <KoeWidget />
      <LockOverlay />
      <OnboardingTour />
    </>
  );
}

function AppSidebar() {
  const { t, i18n } = useTranslation();
  const { setOpenMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useSession();
  const isAdmin =
    (session.data?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true;

  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const buildDateObj = new Date(__BUILD_DATE__);
  const buildDate = buildDateObj.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const buildTime = buildDateObj.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Link
          to="/dashboard"
          onClick={() => setOpenMobile(false)}
          aria-label={t("nav.dashboard")}
          className="flex h-10 items-center gap-2 rounded-md px-2 text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <BrandLogo className="size-7 rounded-lg shadow-sm" />
          <span className="font-heading text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Tokō
          </span>
        </Link>
        <div className="group-data-[collapsible=icon]:hidden">
          <ChildSelector />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => {
          const items = navItems.filter(
            (i) => i.group === group.key && (!i.requiresAdmin || isAdmin),
          );
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.key}>
              <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive =
                      pathname === item.to || pathname.startsWith(`${item.to}/`);
                    return (
                      <SidebarMenuItem key={item.to} data-tour={item.to}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={t(item.labelKey)}
                          render={
                            <Link
                              to={item.to}
                              onClick={() => setOpenMobile(false)}
                              aria-current={isActive ? "page" : undefined}
                            />
                          }
                        >
                          <item.icon />
                          <span>{t(item.labelKey)}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60">
        <UserMenu />
        <div className="px-2 text-[0.6875rem] leading-tight text-muted-foreground group-data-[collapsible=icon]:hidden">
          <p>v{__APP_VERSION__}</p>
          <p>{t("nav.buildAt", { date: buildDate, time: buildTime })}</p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function UserMenu() {
  const { t } = useTranslation();
  const session = useSession();
  const { openKoe, available: koeAvailable } = useKoeTrigger();

  // Better Auth's React client is cast to a generic `ReturnType<typeof createAuthClient>`
  // in auth-client.ts, which drops the inferred additionalFields. Re-narrow here so we
  // can read `isAdmin` (surfaced via `user.additionalFields` on the server).
  const user = session.data?.user as
    | { name: string; email?: string | null; isAdmin?: boolean }
    | undefined;
  if (!user) return null;

  const userInitial = user.name?.trim().charAt(0).toUpperCase() ?? "?";
  const isAdmin = user.isAdmin === true;

  const handleSignOut = () => {
    invalidateSessionCache();
    signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            aria-label={t("nav.userMenu")}
            className="group-data-[collapsible=icon]:px-0"
            data-tour="user-menu"
          />
        }
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {userInitial}
        </span>
        <span className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </span>
            {isAdmin && (
              <Badge variant="secondary" className="shrink-0">
                {t("nav.admin")}
              </Badge>
            )}
          </span>
          {user.email && (
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          )}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="right"
        sideOffset={8}
        className="w-60"
      >
        <DropdownMenuLabel>
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-medium text-foreground">
              {user.name}
            </span>
            {isAdmin && (
              <Badge variant="secondary" className="shrink-0">
                {t("nav.admin")}
              </Badge>
            )}
          </span>
          {user.email && (
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/achievements" />}>
          <Award className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.achievements")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/activity" />}>
          <History className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.activity")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/account" />}>
          <UserCog className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.account")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => useUiStore.getState().resetOnboarding()}>
          <Compass className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.tour")}
        </DropdownMenuItem>
        {koeAvailable && (
          <DropdownMenuItem onClick={openKoe}>
            <LifeBuoy className="size-4 text-muted-foreground" aria-hidden="true" />
            {t("nav.support")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => useUiStore.getState().lock()}>
          <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.lock")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppHeader() {
  const { t } = useTranslation();
  const hasBreadcrumbs = useBreadcrumbs().length > 0;
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 md:px-6 lg:px-8 landscape:max-md:h-10">
      <SidebarTrigger
        aria-label={t("nav.toggleSidebar")}
        className="-ml-1 hidden md:inline-flex"
      />
      {hasBreadcrumbs && (
        <>
          <Separator
            orientation="vertical"
            aria-hidden="true"
            className="hidden h-4 data-vertical:self-center md:block"
          />
          <Breadcrumbs className="min-w-0 flex-1" />
        </>
      )}
      <div className="ml-auto flex items-center">
        <ModeToggle />
      </div>
    </header>
  );
}

function MobileTabBar() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { openMobile, setOpenMobile } = useSidebar();

  const tabs = primaryNavItems.slice(0, 4);

  return (
    <nav
      aria-label={t("nav.primaryNav")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg supports-[backdrop-filter]:bg-background/80"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((item) => {
          const isActive =
            pathname === item.to || pathname.startsWith(`${item.to}/`);
          const label = t(item.shortLabelKey ?? item.labelKey);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                aria-label={t(item.labelKey)}
                className={cn(
                  "flex h-full min-h-14 flex-col items-center justify-center gap-1 px-1 py-1.5 text-xs font-medium transition-colors landscape:max-md:min-h-10 landscape:max-md:gap-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="size-5" aria-hidden="true" />
                <span className="line-clamp-1 leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => setOpenMobile(true)}
            aria-label={t("nav.moreOptions")}
            aria-expanded={openMobile}
            aria-controls="app-sidebar"
            aria-haspopup="dialog"
            className="flex min-h-14 size-full flex-col items-center justify-center gap-1 px-1 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground active:text-foreground landscape:max-md:min-h-10 landscape:max-md:gap-0"
          >
            <Menu className="size-5" aria-hidden="true" />
            <span className="line-clamp-1 leading-tight">{t("nav.more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
