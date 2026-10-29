import { cn } from "@/lib/utils";

const MARK_PATH =
  "M28.75 10.75h42.5a4.75 4.75 0 0 1 0 9.5h-42.5a4.75 4.75 0 0 1 0-9.5ZM20 59.25a30 30 0 1 0 60 0a30 30 0 1 0-60 0ZM31.5 59.25a18.5 22 0 1 1 37 0a18.5 22 0 1 1-37 0Z";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-[#358891]",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
        <path
          transform="translate(14 14) scale(0.72)"
          d={MARK_PATH}
          fill="#fdf9f4"
        />
      </svg>
    </span>
  );
}
