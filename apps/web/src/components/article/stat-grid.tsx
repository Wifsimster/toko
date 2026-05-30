import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type StatItem = {
  value: string;
  label: ReactNode;
  icon?: LucideIcon;
};

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="my-7 grid gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.value}
            className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-center"
          >
            {Icon && (
              <Icon className="mx-auto mb-2 size-5 text-primary/70" />
            )}
            <div className="font-heading text-3xl font-semibold tracking-tight text-primary">
              {item.value}
            </div>
            <div className="mt-1.5 text-xs leading-snug text-muted-foreground">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
