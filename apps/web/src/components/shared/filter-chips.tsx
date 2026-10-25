import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterChipOption<K extends string> = { key: K; label: string };

/**
 * Filtres à choix unique en puces. Chaque puce est un bouton bascule
 * (`aria-pressed`) dans un groupe nommé : un lecteur d'écran annonce le
 * filtre actif. La sélection n'est pas portée par la couleur seule (encre
 * pleine + coche). Cibles de 44 px.
 */
export function FilterChips<K extends string>({
  label,
  options,
  value,
  onChange,
  clear,
  className,
}: {
  /** Nom du groupe, lu par les lecteurs d'écran (« Filtrer les relevés »). */
  label: string;
  options: ReadonlyArray<FilterChipOption<K>>;
  value: K;
  onChange: (key: K) => void;
  /** Bouton « Effacer », affiché seulement quand un filtre est actif. */
  clear?: { label: string; onClear: () => void; visible: boolean };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map(({ key, label: optionLabel }) => {
          const active = key === value;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(key)}
              className={cn(
                "inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
          {clear.label}
        </button>
      )}
    </div>
  );
}
