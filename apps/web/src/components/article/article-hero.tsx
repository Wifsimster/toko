import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Mo } from "@/components/mo/mo";
import { articleTheme } from "@/lib/article-themes";
import { cn } from "@/lib/utils";
import { frenchSpacing } from "@/lib/french-spacing";

export function ArticleHero({
  slug,
  cluster,
  title,
  excerpt,
  chips,
  reviewer,
}: {
  slug: string;
  cluster: string;
  title: ReactNode;
  excerpt?: string;
  chips?: ReactNode[];
  reviewer?: ReactNode;
}) {
  const theme = articleTheme(slug);

  return (
    <header
      data-testid="article-hero"
      className={cn("overflow-hidden rounded-[2rem] px-6 py-8 sm:px-10 sm:py-11", theme.tile)}
    >
      <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">
            {cluster.replace(/^Pillar · /, "")}
          </p>
          <h1 className="mt-3 font-heading text-[2rem] font-extrabold leading-[1.08] tracking-tight text-balance text-foreground sm:text-[2.6rem] lg:text-5xl lg:leading-[1.04]">
            {typeof title === "string" ? frenchSpacing(title) : title}
          </h1>
          {excerpt && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/80">
              {frenchSpacing(excerpt)}
            </p>
          )}
          {chips && chips.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {chips.map((chip, index) => (
                <li
                  key={index}
                  className="rounded-full bg-card/75 px-3.5 py-1.5 text-sm font-semibold text-foreground"
                >
                  {chip}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Mo state={theme.mo} size={128} className="sm:hidden" />
        <Mo state={theme.mo} size={240} className="-my-6 hidden sm:inline-block" />
      </div>
      {reviewer && (
        <p className="mt-7 flex items-start gap-2 border-t border-foreground/10 pt-4 text-sm leading-relaxed text-foreground/75">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-strong" aria-hidden />
          <span>{reviewer}</span>
        </p>
      )}
    </header>
  );
}
