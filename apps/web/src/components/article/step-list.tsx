import type { ReactNode } from "react";

export type StepItem = {
  title: string;
  description: ReactNode;
};

export function StepList({ items }: { items: StepItem[] }) {
  return (
    <ol className="my-7 space-y-4">
      {items.map((item, i) => (
        <li
          key={item.title}
          className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/40 p-4"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-base font-semibold text-primary">
            {i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-semibold text-foreground">
              {item.title}
            </p>
            <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
