import type React from "react";

export function PhoneScript({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-8 rounded-lg bg-primary/5 px-4 py-4 shadow-[inset_3px_0_0_color-mix(in_oklab,var(--primary)_40%,transparent)] sm:px-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--primary)_78%,var(--foreground))]">
        📞 Ce que vous pouvez dire
      </div>
      <div className="mt-2 text-base italic leading-relaxed text-foreground/90">{children}</div>
    </aside>
  );
}
