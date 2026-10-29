import type { ReactNode } from "react";
import { Mo } from "@/components/mo/mo";
import { cn } from "@/lib/utils";

export function EmptyState({
  mo = "accueil",
  title,
  description,
  note,
  action,
  className,
}: {
  mo?: "accueil" | "calme";
  title: ReactNode;
  description?: ReactNode;
  note?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl bg-card px-6 py-8 text-center ring-1 ring-foreground/10",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1">
        {note && (
          <p
            aria-hidden="true"
            className="font-hand max-w-full -rotate-3 text-[1.3125rem] leading-none font-semibold text-muted-foreground [overflow-wrap:anywhere]"
          >
            {note}
          </p>
        )}
        <Mo state={mo} size={112} />
      </div>
      <div className="max-w-sm space-y-1">
        <h2 className="text-lg leading-tight font-extrabold tracking-[-0.02em] text-foreground [overflow-wrap:anywhere]">
          {title}
        </h2>
        {description && (
          <p className="text-[0.9375rem] leading-snug text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
