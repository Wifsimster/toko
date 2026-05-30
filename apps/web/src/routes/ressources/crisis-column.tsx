const borderColors = {
  red: "border-t-red-400 print:border-t-red-500",
  green: "border-t-emerald-400 print:border-t-emerald-500",
  amber: "border-t-amber-400 print:border-t-amber-500",
};

export function CrisisColumn({
  number,
  title,
  subtitle,
  hint,
  lines,
  color,
}: {
  number: number;
  title: string;
  subtitle: string;
  hint: string;
  lines: number;
  color: "red" | "green" | "amber";
}) {
  return (
    <div
      className={`rounded-lg border border-foreground/10 border-t-4 ${borderColors[color]} p-4`}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">
          {number}
        </span>
        <h3 className="font-heading text-sm font-semibold leading-tight">
          {title}
        </h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      <p className="mt-2 text-3xs italic text-muted-foreground/70">
        {hint}
      </p>
      <div className="mt-3 space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={`line-${i}`}
            className="h-6 border-b border-dashed border-foreground/25"
          />
        ))}
      </div>
    </div>
  );
}
