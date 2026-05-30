import type React from "react";

export function PhoneScript({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-4 rounded-lg bg-primary/5 px-4 py-3 shadow-[inset_3px_0_0_oklch(var(--primary)/0.4)]">
      <div className="text-xs font-semibold uppercase tracking-wide text-primary">
        📞 Ce que vous pouvez dire
      </div>
      <div className="mt-1 italic text-foreground/90">{children}</div>
    </aside>
  );
}
