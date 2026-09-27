import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { frenchSpacing } from "@/lib/french-spacing";
import { getClusterTheme } from "./article-cluster-theme";

export function ArticleHero({
  cluster,
  title,
  meta,
}: {
  cluster: string;
  title: ReactNode;
  meta?: ReactNode;
}) {
  const theme = getClusterTheme(cluster);
  const Icon = theme.icon;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br dark:hidden",
          theme.gradient,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-white/30 blur-3xl dark:bg-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-8 size-36 rounded-full bg-white/20 blur-2xl dark:bg-white/5"
      />

      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex items-start gap-4">
          {/* Grande pastille à gauche à partir de `sm` seulement : sur un
              téléphone, cette colonne prenait un quart de la largeur et
              cassait le titre en mots isolés. En dessous, une petite icône
              accompagne le nom du sujet et le titre garde toute la largeur. */}
          <div
            className={cn(
              "hidden size-16 shrink-0 items-center justify-center rounded-2xl shadow-sm sm:flex",
              theme.iconBg,
              theme.iconColor,
            )}
          >
            <Icon className="size-8" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider",
                theme.iconColor,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg sm:hidden",
                  theme.iconBg,
                )}
              >
                <Icon className="size-4" />
              </span>
              {cluster.replace(/^Pillar · /, "")}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-tight text-pretty text-foreground lg:text-4xl lg:leading-[1.15]">
              {typeof title === "string" ? frenchSpacing(title) : title}
            </h1>
            {meta && (
              /* Article metadata uses `foreground/80`, not `muted-foreground`.
                 Against the hero card, `muted-foreground` only reaches 6.3:1
                 in dark and 5.3:1 in light — AA, but hard to read on a phone.
                 `foreground/80` reaches 9.1:1 / 7.9:1 (AAA) while staying
                 quieter than the title, which is full-strength `foreground`. */
              <div className="mt-4 flex flex-wrap items-start gap-x-4 gap-y-2 text-sm text-foreground/80">
                {meta}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
