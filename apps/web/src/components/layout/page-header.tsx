import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

/**
 * En-tête de page de la direction Mō : titre en Plus Jakarta Sans 800
 * (30 px sur mobile, 36 px sur bureau, interligne 1,1), sous-titre en encre
 * douce, l'action à droite sur bureau et sous le texte sur mobile.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1
          id="page-title"
          className="font-heading text-[1.875rem] leading-[1.1] font-extrabold tracking-[-0.025em] text-foreground hyphens-auto [overflow-wrap:break-word] md:text-4xl"
        >
          {title}
        </h1>
        {description && (
          <p className="text-[0.9375rem] leading-snug text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
