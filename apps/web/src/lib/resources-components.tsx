import type { ReactNode } from "react";

/**
 * Callout box for "what you can say" phone scripts.
 * Label is parameterized to support i18n.
 */
export function PhoneScript({
  children,
  label = "📞 Ce que vous pouvez dire",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <aside className="my-4 rounded-lg border-l-4 border-primary/40 bg-primary/5 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-primary">
        {label}
      </div>
      <div className="mt-1 italic text-foreground/90">{children}</div>
    </aside>
  );
}

/**
 * Parent testimonial block used inside article content.
 */
export function Testimonial({
  children,
  source,
  label = "Témoignage",
}: {
  children: ReactNode;
  source: string;
  label?: string;
}) {
  return (
    <aside className="my-6 rounded-lg border border-border/50 bg-muted/30 px-5 py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <blockquote className="mt-2 text-foreground/90 italic">
        {children}
      </blockquote>
      <p className="mt-2 text-sm text-muted-foreground">— {source}</p>
    </aside>
  );
}
