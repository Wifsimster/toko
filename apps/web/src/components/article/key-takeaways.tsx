import type { ReactNode } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function KeyTakeaways({
  title = "Ce qu'il faut retenir",
  items,
}: {
  title?: string;
  items: ReactNode[];
}) {
  return (
    <aside className="my-8 rounded-2xl border border-success-border bg-success-surface p-5">
      <div className="flex items-center gap-2 text-success-foreground">
        <Sparkles className="size-4" />
        <p className="font-heading text-sm font-semibold uppercase tracking-wider">
          {title}
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={String(item)}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-foreground" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
