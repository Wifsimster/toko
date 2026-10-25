import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { pickMoSize, type MoArt, type MoPath, type MoState } from "@focusflow/mo";
import { cn } from "@/lib/utils";
import { useMoArt } from "./use-mo-art";

/**
 * Fait tourner `children` autour de `(x, y)` (coordonnées de la viewBox) par
 * une animation CSS : en SVG, une transformation CSS tourne autour de
 * l'origine du repère local, qu'on déplace sur le pivot. Au repos, les deux
 * translations s'annulent exactement : le dessin est la pose statique.
 */
function Pivot({ at: [x, y], className, children }: { at: readonly [number, number]; className: string; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>
        <g transform={`translate(${-x} ${-y})`}>{children}</g>
      </g>
    </g>
  );
}

/** Les tracés d'un dessin de Mō, à poser dans un `<svg>` ou un `<g>`. */
export function MoPaths({
  art,
  shadow = true,
  overrides,
  wave = false,
  guidedBreath = false,
}: {
  art: MoArt;
  shadow?: boolean;
  /** Tracés remplacés par index (variante de pose d'une scène). */
  overrides?: ReadonlyArray<{ index: number; path: MoPath }>;
  /**
   * Salut de la main, une fois, au montage (états qui ont une main levée,
   * soit « accueil ») : la main pivote au poignet, le corps s'incline à
   * peine. Rien sous `prefers-reduced-motion` (voir `.mo-wave` dans app.css).
   */
  wave?: boolean;
  /**
   * Respiration guidée (voir `guidedBreath` sur `Mo`) : le corps gonfle depuis
   * le sol (`art.ground`), le macron se soulève en plus. L'ombre reste au sol.
   * Pour les dessins qui ont un macron isolé (« calme », « bravo »).
   */
  guidedBreath?: boolean;
}) {
  const paths = art.paths.map((original, i) => {
    const p = overrides?.find((o) => o.index === i)?.path ?? original;
    return !shadow && p.part === "shadow" ? null : (
      <path
        // Liste figée, générée : l'index est une clé stable.
        key={i}
        d={p.d}
        fill={p.fill}
        stroke={p.stroke}
        strokeWidth={p.strokeWidth}
        opacity={p.opacity}
      />
    );
  });
  const parts = art.paths.map((p) => p.part);
  const firstMacron = parts.indexOf("macron");
  if (guidedBreath && art.ground && firstMacron >= 0) {
    const body = (i: number) => parts[i] !== "shadow" && parts[i] !== "macron";
    return (
      <>
        {paths.filter((_, i) => parts[i] === "shadow")}
        <Pivot at={art.ground} className="mo-guided-breath-body">
          {paths.filter((_, i) => i < firstMacron && body(i))}
          <g className="mo-guided-breath-macron">{paths.filter((_, i) => parts[i] === "macron")}</g>
          {paths.filter((_, i) => i > firstMacron && body(i))}
        </Pivot>
      </>
    );
  }
  if (!wave || !art.wave) return <>{paths}</>;

  // L'ombre reste au sol ; la main garde sa place dans l'ordre de peinture
  // (derrière le corps), groupée pour tourner autour du poignet.
  const hand = paths.filter((_, i) => parts[i] === "wave");
  const firstHand = parts.indexOf("wave");
  return (
    <>
      {paths.filter((_, i) => parts[i] === "shadow")}
      <Pivot at={art.wave.ground} className="mo-wave-body">
        {paths.filter((_, i) => i < firstHand && parts[i] !== "shadow")}
        <Pivot at={art.wave.pivot} className="mo-wave-hand">
          {hand}
        </Pivot>
        {paths.filter((_, i) => i > firstHand && parts[i] !== "wave" && parts[i] !== "shadow")}
      </Pivot>
    </>
  );
}

type MoProps = {
  state: MoState;
  /** Côté en pixels. Sous 96 px, la version petite (trait plus épais) est choisie seule. */
  size: number;
  /**
   * Par défaut Mō est décoratif (`aria-hidden`). Avec `label`, Mō devient une
   * image (`role="img"`) : passer `true` pour le libellé français par défaut
   * de l'état, ou un texte.
   */
  label?: string | true;
  /**
   * Une respiration douce (4 s) à l'apparition, jamais en boucle ; aucune
   * sous `prefers-reduced-motion`.
   */
  breathe?: boolean;
  /**
   * Mō dit bonjour de la main à l'apparition (1,2 s, état « accueil »), puis
   * ne bouge plus ; un clic sur Mō rejoue le salut, une fois par clic. Aucun
   * mouvement sous `prefers-reduced-motion`.
   */
  wave?: boolean;
  /**
   * Mō respire avec le parent, au rythme de l'exercice « Respirez avec moi »
   * du SOS (seule exception à « jamais en boucle » et « jamais en mode
   * crise », DESIGN.md). `startedAt` est l'instant (`performance.now()`) où
   * l'exercice a commencé : le dessin arrive en différé, il reprend le cycle
   * là où en est le cercle. Rien sous `prefers-reduced-motion` (app.css,
   * `.mo-guided-breath-*`). Réservé à l'état « calme ».
   */
  guidedBreath?: { startedAt: number };
  /** Ombre portée au sol. */
  shadow?: boolean;
  className?: string;
};

/**
 * Mō, la mascotte de Tokō. Règles d'usage : DESIGN.md, section « Mō ».
 * Jamais en mode crise (sauf « Respirez avec moi », `guidedBreath`), sur le
 * rapport PDF ni à côté d'un paywall.
 */
export function Mo({ state, size, label, breathe = false, wave = false, guidedBreath, shadow = true, className }: MoProps) {
  const { t } = useTranslation();
  const art = useMoArt(state, pickMoSize(size));
  const accessibleName = label === true ? t(`mo.label.${state}`) : label;
  // Chaque salut remonte le groupe animé (clé) : l'animation CSS repart de zéro.
  const [greeting, setGreeting] = useState({ count: 0, playing: true });
  const canWave = wave && !!art?.wave;
  const svgRef = useRef<SVGSVGElement>(null);
  const breathStartedAt = guidedBreath?.startedAt;
  const hasArt = art !== null;

  // Posé une fois, quand le dessin apparaît, avant la première peinture : un
  // délai négatif cale l'animation CSS sur le cycle déjà en cours. Jamais
  // retouché ensuite (changer le délai d'une animation en cours la ferait
  // sauter).
  useLayoutEffect(() => {
    if (!hasArt || breathStartedAt === undefined) return;
    const elapsed = Math.max(0, performance.now() - breathStartedAt);
    svgRef.current?.style.setProperty("--mo-breath-delay", `${-elapsed}ms`);
  }, [hasArt, breathStartedAt]);

  return (
    <span
      className={cn("inline-block shrink-0", className)}
      style={{ width: size, height: size }}
      data-mo={state}
      onClick={canWave ? () => setGreeting((g) => (g.playing ? g : { count: g.count + 1, playing: true })) : undefined}
      onAnimationEnd={
        canWave
          ? (e) => {
              if (e.animationName === "mo-wave-hand") setGreeting((g) => ({ ...g, playing: false }));
            }
          : undefined
      }
      {...(accessibleName
        ? { role: "img", "aria-label": accessibleName }
        : { "aria-hidden": true })}
    >
      {art && (
        <svg
          ref={svgRef}
          viewBox={art.viewBox}
          width={size}
          height={size}
          aria-hidden="true"
          focusable="false"
          className="block overflow-visible"
        >
          <g className={breathe ? "mo-breathe" : undefined}>
            <MoPaths key={greeting.count} art={art} shadow={shadow} wave={wave} guidedBreath={!!guidedBreath} />
          </g>
        </svg>
      )}
    </span>
  );
}
