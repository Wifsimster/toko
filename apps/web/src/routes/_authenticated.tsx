import {
  createFileRoute,
  Outlet,
  Link,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Heart, LogOut, LifeBuoy, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { KoeWidget, useKoeTrigger } from "@/components/koe-widget";
import { FloatingTipButton } from "@/components/shared/floating-tip-button";
import { Breadcrumbs, useBreadcrumbs } from "@/components/layout/breadcrumbs";
import { navGroups, navItems, primaryNavItems } from "@/config/nav";
import {
  getCachedSession,
  invalidateSessionCache,
  useSession,
  signOut,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        {t("nav.skipToContent")}
      </a>

      <AppSidebar />

      <SidebarInset
        id="main"
        tabIndex={-1}
        aria-labelledby="page-title"
        className={cn(
          "min-w-0 focus:outline-none",
          isMobile && "pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
        )}
      >
        <AppHeader />

        <div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>

        {isMobile && <MobileTabBar />}
      </SidebarInset>

      <FloatingTipButton />
      <KoeWidget />
    </>
  );
}

function AppSidebar() {
  const { t, i18n } = useTranslation();
  const { setOpenMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
          className="flex h-10 items-center gap-2 rounded-md px-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Heart className="h-3.5 w-3.5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Toko
          </span>
        </Link>
        <div className="group-data-[collapsible=icon]:hidden">
          <ChildSelector />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => {
          const items = navItems.filter((i) => i.group === group.key);
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
                      <SidebarMenuItem key={item.to}>
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

      <SidebarFooter>
        <UserMenu />
        <div className="px-2 pb-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
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
  const [open, setOpen] = useState(false);
  const { openKoe, available: koeAvailable } = useKoeTrigger();

  const user = session.data?.user;
  if (!user) return null;

  const userInitial = user.name?.trim().charAt(0).toUpperCase() ?? "?";

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <SidebarMenuButton
            size="lg"
            aria-label={t("nav.userMenu")}
            className="group-data-[collapsible=icon]:px-0"
          />
        }
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {userInitial}
        </span>
        <span className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-medium text-sidebar-foreground">
            {user.name}
          </span>
          {user.email && (
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          )}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-60 gap-0 p-1">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="truncate text-sm font-medium text-foreground">
            {user.name}
          </span>
          {user.email && (
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          )}
        </div>
        <Separator className="my-1" />
        {koeAvailable && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openKoe();
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
          >
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
            {t("nav.support")}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            handleSignOut();
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
          {t("nav.logout")}
        </button>
      </PopoverContent>
    </Popover>
  );
}

function AppHeader() {
  const { t } = useTranslation();
  const hasBreadcrumbs = useBreadcrumbs().length > 0;
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 md:px-6 lg:px-8">
      <SidebarTrigger
        aria-label={t("nav.toggleSidebar")}
        className="-ml-1"
      />
      {hasBreadcrumbs && (
        <>
          <Separator
            orientation="vertical"
            aria-hidden="true"
            className="h-4"
          />
          <Breadcrumbs className="min-w-0 flex-1" />
        </>
      )}
    </header>
  );
}

function MobileTabBar() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile } = useSidebar();

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
                className={cn(
                  "flex h-full min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
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
            className="flex h-full min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="line-clamp-1 leading-tight">{t("nav.more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
