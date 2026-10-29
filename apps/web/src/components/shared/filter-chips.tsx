import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterChipOption<K extends string> = { key: K; label: string };

export function FilterChips<K extends string>({
  label,
  options,
  value,
  onChange,
  clear,
  className,
}: {
  label: string;
  options: ReadonlyArray<FilterChipOption<K>>;
  value: K;
  onChange: (key: K) => void;
  clear?: { label: string; onClear: () => void; visible: boolean };
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2 sm:flex-wrap", className)}>
      <div
        role="group"
        aria-label={label}
        className="-m-1.5 flex min-w-0 flex-1 scroll-px-1.5 gap-2 overflow-x-auto p-1.5 [scrollbar-width:thin] sm:flex-initial sm:flex-wrap sm:overflow-visible"
      >
        {options.map(({ key, label: optionLabel }) => {
          const active = key === value;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(key)}
              onFocus={(e) =>
                e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })
              }
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 whitespace-nowrap sm:max-w-full sm:shrink sm:whitespace-normal text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "bg-primary pl-3 text-primary-foreground"
                  : "bg-card text-foreground ring-1 ring-border hover:bg-muted",
              )}
            >
              {active && <Check className="size-4 shrink-0" aria-hidden="true" />}
              <span className="min-w-0 [overflow-wrap:anywhere]">{optionLabel}</span>
            </button>
          );
        })}
      </div>
      {clear?.visible && (
        <button
          type="button"
          onClick={clear.onClear}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
          {clear.label}
        </button>
      )}
    </div>
  );
}
