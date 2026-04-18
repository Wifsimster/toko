import {
  createFileRoute,
  Outlet,
  Link,
  redirect,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  BookOpen,
  Activity,
  Menu,
  LogOut,
  Heart,
  ClipboardList,
  Trophy,
  UserCog,
  HandHeart,
  Pill,
  Newspaper,
  ChevronDown,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUiStore } from "@/stores/ui-store";
import { ChildSelector } from "@/components/shared/child-selector";
import { KoeWidget, useKoeTrigger } from "@/components/koe-widget";
import { FloatingTipButton } from "@/components/shared/floating-tip-button";
import { useState } from "react";
import { getCachedSession, invalidateSessionCache, useSession, signOut } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await getCachedSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

const navItems = [
  { to: "/dashboard" as const, labelKey: "nav.dashboard", icon: BarChart3 },
  { to: "/journal" as const, labelKey: "nav.journal", icon: BookOpen },
  { to: "/symptoms" as const, labelKey: "nav.symptoms", icon: Activity },
  { to: "/rewards" as const, labelKey: "nav.rewards", icon: Trophy },
  { to: "/crisis-list" as const, labelKey: "nav.crisisList", icon: HandHeart },
  { to: "/medications" as const, labelKey: "nav.medications", icon: Pill },
  { to: "/barkley" as const, labelKey: "nav.barkley", icon: ClipboardList },
  { to: "/actualites" as const, labelKey: "nav.news", icon: Newspaper },
  { to: "/account" as const, labelKey: "nav.account", icon: UserCog },
] as const;

// Primary items shown in the mobile bottom tab bar (4 slots + "More")
const mobileTabItems = [
  { to: "/dashboard" as const, labelKey: "nav.home", icon: BarChart3 },
  { to: "/crisis-list" as const, labelKey: "nav.crisis", icon: HandHeart },
  { to: "/journal" as const, labelKey: "nav.journal", icon: BookOpen },
  { to: "/rewards" as const, labelKey: "nav.rewardsShort", icon: Trophy },
] as const;

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t, i18n } = useTranslation();
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
    <div className="flex h-full flex-col">
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:py-2 [&.active]:bg-primary/10 [&.active]:text-primary"
          >
            <item.icon className="h-4 w-4" />
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-4 py-3 text-xs text-muted-foreground/50">
        <p>v{__APP_VERSION__}</p>
        <p>{t("nav.buildAt", { date: buildDate, time: buildTime })}</p>
      </div>
    </div>
  );
}

function AuthenticatedLayout() {
  const { t } = useTranslation();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const session = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { openKoe, available: koeAvailable } = useKoeTrigger();

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

  const user = session.data?.user;
  const userInitial = user?.name?.trim().charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center gap-2 px-[max(0.75rem,env(safe-area-inset-left))] sm:gap-3 sm:px-[max(1rem,env(safe-area-inset-left))] lg:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-3.5 w-3.5" />
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Toko
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
            <ChildSelector />
            {user && (
              <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t("nav.userMenu")}
                      className="hidden h-9 items-center gap-2 px-2 md:inline-flex"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {userInitial}
                      </span>
                      <span className="max-w-[10rem] truncate text-sm text-foreground">
                        {user.name}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  }
                />
                <PopoverContent align="end" className="w-60 gap-0 p-1">
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
                        setUserMenuOpen(false);
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
                      setUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    {t("nav.logout")}
                  </button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 border-r border-border/60 bg-background lg:flex lg:flex-col">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 pb-[calc(4.5rem+max(0.5rem,env(safe-area-inset-bottom)))] sm:p-6 lg:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label={t("nav.primaryNav")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {mobileTabItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex h-full min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-2xs font-medium text-muted-foreground transition-colors active:bg-accent/60 [&.active]:text-primary"
              >
                <item.icon className="h-5 w-5" />
                <span className="leading-tight">{t(item.labelKey)}</span>
              </Link>
            </li>
          ))}
          <li>
            <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
              <SheetTrigger
                render={
                  <button
                    type="button"
                    aria-label={t("nav.moreOptions")}
                    className="flex h-full min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-2xs font-medium text-muted-foreground transition-colors active:bg-accent/60"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="leading-tight">{t("nav.more")}</span>
                  </button>
                }
              />
              <SheetContent side="left" className="max-w-[20rem] p-0">
                <SheetTitle className="sr-only">{t("nav.moreOptions")}</SheetTitle>
                <div className="flex h-14 items-center gap-2 px-6">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-heading text-lg font-semibold tracking-tight">
                    Toko
                  </span>
                </div>
                <Separator />
                <div className="flex h-[calc(100%-3.5rem-env(safe-area-inset-top))] flex-col">
                  <Sidebar onNavigate={() => toggleSidebar()} />
                  <Separator />
                  <div className="px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    {session.data?.user?.name && (
                      <p className="px-3 pb-2 text-xs text-muted-foreground">
                        {t("nav.loggedInAs")}{" "}
                        <span className="font-medium text-foreground">
                          {session.data.user.name}
                        </span>
                      </p>
                    )}
                    {koeAvailable && (
                      <button
                        type="button"
                        onClick={() => {
                          toggleSidebar();
                          openKoe();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <LifeBuoy className="h-4 w-4" />
                        {t("nav.support")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>

      <FloatingTipButton />
      <KoeWidget />
    </div>
  );
}
