import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";

export function ResourcesIndexTopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-[max(1rem,env(safe-area-inset-left))]">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo className="size-8 rounded-lg" />
          <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Tokō
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm sm:flex">
          <Link
            to="/ressources"
            className="font-medium text-foreground transition-colors"
          >
            Ressources
          </Link>
          <Link
            to="/tarifs"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tarifs
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" className="text-muted-foreground">
              Connexion
            </Button>
          </Link>
          <Link to="/login">
            <Button className="gap-2 shadow-sm">
              Commencer
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
