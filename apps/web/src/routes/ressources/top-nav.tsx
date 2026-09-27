import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { ReadingProgress } from "@/components/article/reading-progress";
import { SignupCtaLink } from "@/components/shared/signup-cta-link";

export function TopNav({
  /**
   * Avancement de lecture collé sous l'en-tête, sur les pages d'article.
   */
  showReadingProgress = false,
  /**
   * Sur une page d'article, le bouton plein est l'élément le plus contrasté
   * de l'écran et vient concurrencer le titre pendant tout le défilement.
   * En version discrète il reste atteignable en permanence sans tirer l'œil
   * hors du texte — les appels à l'action pleins restent dans l'article.
   */
  quietCta = false,
}: {
  showReadingProgress?: boolean;
  quietCta?: boolean;
} = {}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 pt-[env(safe-area-inset-top)]">
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
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Ressources
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hidden text-muted-foreground sm:inline-flex",
            )}
          >
            Connexion
          </Link>
          <SignupCtaLink
            location="article_nav"
            className={cn(
              buttonVariants({ variant: quietCta ? "outline" : "default" }),
              quietCta ? "gap-2" : "gap-2 shadow-sm",
            )}
          >
            Commencer
            <ArrowRight className="size-3.5" />
          </SignupCtaLink>
        </div>
      </div>
      {showReadingProgress && <ReadingProgress />}
    </header>
  );
}
