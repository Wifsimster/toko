import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Mo } from "@/components/mo/mo";
import { OUTILS } from "@/lib/outils";
import { umamiTrack } from "@/lib/umami";
import { cn } from "@/lib/utils";

export function OutilsGrid({ depuis, className }: { depuis: string; className?: string }) {
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2", className)}>
      {OUTILS.map((outil) => (
        <li key={outil.id}>
          <Link
            to={outil.to}
            onClick={() => umamiTrack("outil-clic", { outil: outil.id, depuis })}
            className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-card ring-1 ring-foreground/10 transition-shadow hover:ring-brand/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className={cn("flex items-end justify-between gap-3 px-5 pt-4", outil.tile)}>
              <span className="mb-4 rounded-full bg-card/75 px-2.5 py-1 text-xs font-semibold text-foreground">
                Gratuit · sans compte
              </span>
              <Mo state={outil.mo} size={96} className="-mb-1" />
            </div>
            <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
              <h3 className="font-heading text-xl font-extrabold leading-snug tracking-tight group-hover:text-brand-strong">
                {outil.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {outil.description}
              </p>
              <p className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm">
                <span className="text-muted-foreground">{outil.meta}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-brand-strong">
                  Ouvrir
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
