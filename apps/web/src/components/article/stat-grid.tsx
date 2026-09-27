import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type StatItem = {
  value: string;
  label: ReactNode;
  icon?: LucideIcon;
};

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div data-article-block className="my-9 grid gap-4 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.value}
            className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 sm:px-5 sm:py-7 sm:text-center"
          >
            {/* Sur mobile les cartes s'empilent : icône et chiffre sur une
                ligne, libellé aligné à gauche dessous. Centrées, trois cartes
                hautes occupaient plus d'un écran pour trois chiffres. */}
            <div className="flex items-center gap-2.5 sm:block">
              {Icon && (
                <Icon className="size-5 shrink-0 text-primary/80 sm:mx-auto sm:mb-3" />
              )}
              <div className="font-heading text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                {item.value}
              </div>
            </div>
            <div className="mt-1.5 text-sm leading-relaxed text-balance text-foreground/80 sm:mt-2">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
