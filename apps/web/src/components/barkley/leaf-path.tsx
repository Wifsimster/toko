import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

function Leaf({ flip }: { flip: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-6", flip && "-scale-x-100")}>
      <path d="M5 19C5 11 10 5 19 5c0 9-6 14-14 14z" fill="#6E9E7C" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 19c4-4 7-7 10-10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function LeafPath({
  completed,
  current,
  total = 10,
}: {
  completed: ReadonlySet<number>;
  current: number | null;
  total?: number;
}) {
  const { t } = useTranslation();
  return (
    <ol aria-label={t("barkley.path.leafLabel", { count: completed.size })} className="flex items-center">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = completed.has(n);
        const isCurrent = n === current;
        return (
          <Fragment key={n}>
            {i > 0 && <span aria-hidden="true" className="h-0.5 min-w-1 flex-1 bg-border" />}
            <li
              aria-label={t(done ? "barkley.path.leafDone" : isCurrent ? "barkley.path.leafCurrent" : "barkley.path.leafUpcoming", { number: n })}
              aria-current={isCurrent ? "step" : undefined}
              className="flex size-7 shrink-0 items-center justify-center text-foreground"
            >
              {done ? (
                <Leaf flip={i % 2 === 1} />
              ) : isCurrent ? (
                <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                  {n}
                </span>
              ) : (
                <span aria-hidden="true" className="block size-5 rounded-full bg-muted" />
              )}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
