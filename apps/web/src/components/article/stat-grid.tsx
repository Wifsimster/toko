import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type StatItem = {
  value: string;
  label: ReactNode;
  icon?: LucideIcon;
};

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="my-9 grid gap-4 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.value}
            className="rounded-xl border border-border/50 bg-card/60 px-5 py-7 text-center"
          >
            {Icon && (
              <Icon className="mx-auto mb-3 size-5 text-primary/80" />
            )}
            <div className="font-heading text-4xl font-semibold tracking-tight text-primary">
              {item.value}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-foreground/80">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
