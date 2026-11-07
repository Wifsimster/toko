import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { frenchSpacingNode } from "@/lib/french-spacing";
import { cn } from "@/lib/utils";

const TILES = ["bg-surface-sky", "bg-surface-mint", "bg-surface-honey"] as const;

export type StatItem = {
  value: string;
  label: ReactNode;
  icon?: LucideIcon;
};

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div data-article-block className="my-9 grid gap-4 sm:grid-cols-3">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.value}
            className={cn("rounded-[1.5rem] px-5 py-5 sm:py-6", TILES[index % TILES.length])}
          >
            <div className="flex items-center gap-2.5 sm:block">
              {Icon && (
                <Icon className="size-5 shrink-0 text-brand-strong sm:mb-3" />
              )}
              <div className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-brand-strong">
                {frenchSpacingNode(item.value)}
              </div>
            </div>
            <div className="mt-1.5 text-sm leading-relaxed text-foreground/80 sm:mt-2">
              {frenchSpacingNode(item.label)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
