import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { frenchSpacing, frenchSpacingNode } from "@/lib/french-spacing";

export type IconListItem = {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
};

export function IconList({ items }: { items: IconListItem[] }) {
  return (
    <ul data-icon-list className="my-6 grid gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const title = frenchSpacing(item.title.replace(/\s*:\s*$/, ""));
        const description =
          typeof item.description === "string"
            ? item.description.charAt(0).toUpperCase() +
              item.description.slice(1)
            : item.description;
        return (
          <li
            key={item.title}
            className="rounded-xl border border-border/50 bg-card/50 px-4 py-4"
          >
            <span className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-strong"
              >
                <Icon className="size-4" />
              </span>
              <strong className="font-heading text-base leading-snug">
                {title}
              </strong>
            </span>
            <span className="mt-2 block text-base leading-relaxed text-foreground/85">
              {frenchSpacingNode(description)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
