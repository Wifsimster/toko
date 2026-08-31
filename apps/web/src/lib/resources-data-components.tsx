import type React from "react";

export function PhoneScript({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-8 rounded-lg bg-primary/5 px-4 py-4 shadow-[inset_3px_0_0_oklch(var(--primary)/0.4)] sm:px-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-primary">
        📞 Ce que vous pouvez dire
      </div>
      <div className="mt-2 text-base italic leading-relaxed text-foreground/90">{children}</div>
    </aside>
  );
}
