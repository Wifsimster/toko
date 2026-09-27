import { useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import type { ArticleCoverImage } from "@/lib/resources-types";

/**
 * Illustration de couverture affichée en tête d'article.
 *
 * L'image est décorative au sens éditorial mais porte du sens (elle montre la
 * scène dont parle l'article), d'où un `alt` descriptif. Les dimensions
 * intrinsèques sont déclarées pour que le navigateur réserve la place avant le
 * chargement : pas de saut de mise en page pendant la lecture — un
 * déplacement du texte en cours de lecture coûte cher à un parent fatigué.
 *
 * Largeur bornée (`max-w-sm`) parce que l'illustration est au format portrait :
 * en pleine largeur de colonne, elle repousserait le début du texte d'un écran
 * entier sur téléphone.
 *
 * Couverture animée (`cover.video`) : boucle muette en lecture automatique,
 * avec `src` comme affiche. Sous `prefers-reduced-motion`, seule l'image fixe
 * est rendue et la vidéo n'est pas téléchargée. Un bouton discret met la
 * boucle en pause (WCAG 2.2.2 : tout mouvement de plus de 5 s doit pouvoir
 * s'arrêter).
 */
const FRAME = "w-full rounded-2xl border border-border/50 shadow-sm";

export function ArticleCover({ cover }: { cover: ArticleCoverImage }) {
  const reducedMotion = usePrefersReducedMotion();
  const animated = cover.video && (cover.video.webm || cover.video.mp4);

  return (
    <figure className="mb-8">
      {animated && !reducedMotion ? (
        <CoverVideo cover={cover} />
      ) : (
        <img
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          loading="eager"
          decoding="async"
          className={`mx-auto max-w-sm ${FRAME}`}
        />
      )}
    </figure>
  );
}

function CoverVideo({ cover }: { cover: ArticleCoverImage }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div role="img" aria-label={cover.alt}>
        <video
          ref={ref}
          poster={cover.src}
          width={cover.width}
          height={cover.height}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className={`h-auto ${FRAME}`}
        >
          {cover.video?.webm && <source src={cover.video.webm} type="video/webm" />}
          {cover.video?.mp4 && <source src={cover.video.mp4} type="video/mp4" />}
        </video>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? "Relancer l'animation" : "Mettre l'animation en pause"}
        className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
      </button>
    </div>
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const canQuery = () => typeof window !== "undefined" && typeof window.matchMedia === "function";

function subscribe(onChange: () => void) {
  if (!canQuery()) return () => {};
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// Sans `matchMedia` (rendu serveur, tests), on choisit l'image fixe.
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => !canQuery() || window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
}
