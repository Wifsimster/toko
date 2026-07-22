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
      <div className="rounded-xl border border-success-border bg-success-surface p-5">
        <div className="mb-3 flex items-center gap-2 text-success-foreground">
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
                className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-status-success"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-danger-border bg-danger-surface p-5">
        <div className="mb-3 flex items-center gap-2 text-danger-foreground">
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
                className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-status-danger"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
