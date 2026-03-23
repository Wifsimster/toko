import {
  createFileRoute,
  Outlet,
  Link,
  redirect,
} from "@tanstack/react-router";
import {
  BarChart3,
  Pill,
  BookOpen,
  Activity,
  Menu,
  LogOut,
  FileText,
  CalendarDays,
  Heart,
  ClipboardList,
  Trophy,
  UserCog,
  HandHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useUiStore } from "@/stores/ui-store";
import { ChildSelector } from "@/components/shared/child-selector";
import { authClient, useSession, signOut } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

const navItems = [
  { to: "/dashboard" as const, label: "Tableau de bord", icon: BarChart3 },
  { to: "/rewards" as const, label: "Récompenses", icon: Trophy },
  { to: "/crisis-list" as const, label: "Liste de crise", icon: HandHeart },
  { to: "/symptoms" as const, label: "Symptômes", icon: Activity },
  { to: "/medications" as const, label: "Médicaments", icon: Pill },
  { to: "/journal" as const, label: "Journal", icon: BookOpen },
  { to: "/appointments" as const, label: "Rendez-vous", icon: CalendarDays },
  { to: "/report" as const, label: "Rapport", icon: FileText },
  { to: "/barkley" as const, label: "Programme Barkley", icon: ClipboardList },
  { to: "/account" as const, label: "Mon compte", icon: UserCog },
];

function Sidebar() {
  const buildDate = new Date(__BUILD_DATE__).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-full flex-col">
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-4 py-3 text-[11px] text-muted-foreground/50">
        <p>v{__APP_VERSION__}</p>
        <p>Build du {buildDate}</p>
      </div>
    </div>
  );
}

function AuthenticatedLayout() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const session = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
        <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
          <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-14 items-center gap-2 px-6">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Heart className="h-3.5 w-3.5" />
                </div>
                <span className="font-heading text-lg font-semibold tracking-tight">
                  Toko
                </span>
              </div>
              <Separator />
              <Sidebar />
            </SheetContent>
          </Sheet>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-3.5 w-3.5" />
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Toko
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <ChildSelector />
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.data?.user?.name}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 border-r border-border/60 bg-background lg:flex lg:flex-col">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
