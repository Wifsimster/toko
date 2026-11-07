import { useId, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Printer } from "lucide-react";
import type { MoState } from "@focusflow/mo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mo } from "@/components/mo/mo";
import { umamiTrack } from "@/lib/umami";
import type { OutilId } from "@/lib/outils";
import { cn } from "@/lib/utils";

export function ToolHero({
  tile,
  mo,
  eyebrow,
  title,
  intro,
  children,
}: {
  tile: string;
  mo: MoState;
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <Link
        to="/outils"
        className="-my-3 inline-flex items-center gap-1.5 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Tous les outils
      </Link>
      <header
        className={cn(
          "mt-4 flex flex-col-reverse gap-4 rounded-[2rem] px-6 py-8 sm:flex-row sm:items-center sm:gap-8 sm:px-10 sm:py-10",
          tile,
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">{eyebrow}</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/80">{intro}</p>
          {children}
        </div>
        <Mo state={mo} size={112} className="sm:hidden" />
        <Mo state={mo} size={184} className="hidden sm:inline-block" />
      </header>
    </>
  );
}

export function PrintButton({ outil, className }: { outil: OutilId; className?: string }) {
  return (
    <Button
      size="lg"
      className={cn("gap-2", className)}
      onClick={() => {
        umamiTrack("outil-utilise", { outil });
        window.print();
      }}
    >
      <Printer className="size-4" aria-hidden />
      Imprimer ou enregistrer en PDF
    </Button>
  );
}

export function ToolStep({
  index,
  title,
  hint,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <p className="text-xs font-extrabold tracking-[0.12em] text-brand-strong">
        {String(index).padStart(2, "0")}
      </p>
      <h2 className="mt-1 font-heading text-xl font-extrabold tracking-tight">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

export function ChipChoices({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: readonly string[];
  selected: readonly string[];
  onToggle: (option: string) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(option)}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-left text-sm font-semibold transition-colors md:min-h-9",
                on
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-accent",
              )}
            >
              {on && <Check className="size-3.5 shrink-0" aria-hidden />}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ToolTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={600}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function toggleIn(list: readonly string[], option: string): string[] {
  return list.includes(option) ? list.filter((o) => o !== option) : [...list, option];
}

export function PrintBlock({
  title,
  items,
  text,
  lines = 3,
}: {
  title: string;
  items?: readonly string[];
  text?: string;
  lines?: number;
}) {
  const hasItems = !!items && items.length > 0;
  const hasText = !!text && text.trim().length > 0;
  return (
    <section className="fiche-block break-inside-avoid">
      <h3 className="font-heading text-base font-extrabold tracking-tight">{title}</h3>
      {hasItems && (
        <ul className="mt-2 grid gap-1 text-sm">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden className="shrink-0 font-bold text-brand-strong">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
      {hasText && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{text}</p>}
      {!hasItems && !hasText && (
        <div className="mt-2 grid gap-4" aria-hidden>
          {Array.from({ length: lines }, (_, i) => (
            <div key={i} className="h-5 border-b border-dashed border-foreground/30" />
          ))}
        </div>
      )}
    </section>
  );
}
