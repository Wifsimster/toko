import type { ReactNode } from "react";
import { frenchSpacingNode } from "@/lib/french-spacing";
import { cn } from "@/lib/utils";

const CHIPS = ["bg-surface-sky", "bg-surface-mint", "bg-surface-honey", "bg-surface-lavender", "bg-surface-peach"] as const;

export function KeyTakeaways({
  title = "Ce qu'il faut retenir",
  items,
}: {
  title?: string;
  items: ReactNode[];
}) {
  return (
    <aside className="my-10 rounded-[1.75rem] bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
      <p className="!my-0 font-heading text-xl font-extrabold tracking-tight text-foreground">
        {title}
      </p>
      <ul data-icon-list className="mt-5 space-y-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3.5 text-base leading-relaxed text-foreground/90"
          >
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[0.6rem] font-heading text-sm font-extrabold text-foreground",
                CHIPS[index % CHIPS.length],
              )}
            >
              {index + 1}
            </span>
            <span className="min-w-0">{frenchSpacingNode(item)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
