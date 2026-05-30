import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
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
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm sm:h-16 sm:w-16",
              theme.iconBg,
              theme.iconColor,
            )}
          >
            <Icon className="size-7 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                theme.iconColor,
              )}
            >
              {cluster.replace(/^Pillar · /, "")}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground lg:text-4xl lg:leading-[1.15]">
              {title}
            </h1>
            {meta && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {meta}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
