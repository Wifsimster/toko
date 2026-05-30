import type { ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export function Comparison({
  helpsTitle = "Ce qui aide",
  hurtsTitle = "Ce qui aggrave",
  helps,
  hurts,
}: {
  helpsTitle?: string;
  hurtsTitle?: string;
  helps: ReactNode[];
  hurts: ReactNode[];
}) {
  return (
    <div className="my-7 grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <div className="mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-4" />
          <p className="font-heading text-sm font-semibold uppercase tracking-wider">
            {helpsTitle}
          </p>
        </div>
        <ul className="space-y-2">
          {helps.map((item) => (
            <li
              key={String(item)}
              className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
            >
              <span
                aria-hidden
                className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-emerald-500"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-rose-200/60 bg-rose-50/40 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
        <div className="mb-3 flex items-center gap-2 text-rose-700 dark:text-rose-300">
          <XCircle className="size-4" />
          <p className="font-heading text-sm font-semibold uppercase tracking-wider">
            {hurtsTitle}
          </p>
        </div>
        <ul className="space-y-2">
          {hurts.map((item) => (
            <li
              key={String(item)}
              className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
            >
              <span
                aria-hidden
                className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-rose-500"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
