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
  { to: "/symptoms" as const, label: "Symptômes", icon: Activity },
  { to: "/medications" as const, label: "Médicaments", icon: Pill },
  { to: "/journal" as const, label: "Journal", icon: BookOpen },
  { to: "/appointments" as const, label: "Rendez-vous", icon: CalendarDays },
  { to: "/report" as const, label: "Rapport", icon: FileText },
];

function Sidebar() {
  return (
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
    <div className="min-h-screen bg-background">
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

      <div className="flex">
        <aside className="hidden w-64 border-r border-border/60 bg-background lg:block">
          <Sidebar />
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
