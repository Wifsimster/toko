import { useMemo } from "react";
import { gardenArt } from "@focusflow/mo/garden";
import { cn } from "@/lib/utils";

export function GardenArt({
  leaves,
  freshLast = false,
  className,
}: {
  leaves: number;
  freshLast?: boolean;
  className?: string;
}) {
  const art = useMemo(() => gardenArt(leaves, { freshLast }), [leaves, freshLast]);
  return (
    <svg viewBox={art.viewBox} aria-hidden="true" className={cn("block h-auto w-full", className)}>
      {art.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill ?? "none"}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-5", className)}>
      <path
        d="M5 19C5 11 10 5 19 5c0 9-6 14-14 14z"
        fill="#6E9E7C"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5 19c4-4 7-7 10-10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
